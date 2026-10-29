# SnapShare: Scaling a Photo-Sharing App
**Day 7 Assignment | System Design and Scalability**

## 1. Overview and Assumptions

SnapShare is a photo-sharing platform where users upload photos and scroll through a feed of content posted by people they follow. The system must handle frequent feed requests, store large amounts of media, and generate thumbnails without slowing down uploads.

### Starting assumptions

- Registered users: **10 million**
- Daily active users (DAU): **10% of registered users**
- Upload frequency: **1 photo per active user per day**
- Feed usage: **50 feed-page views per active user per day**
- Average original photo size: **2 MB**
- Average thumbnail size: **50 KB**
- Days per year: **365**
- Peak traffic: **5 times the average traffic**
- Storage calculations use decimal units (1 TB = 1,000 GB). They exclude backups, replicas, metadata, logs, and temporary files unless stated otherwise.
- Every uploaded photo generates one thumbnail. Each feed-page view is treated as one request to retrieve a page of feed content, not one request per individual photo.
- Traffic is distributed across 24 hours for average-rate calculations, although real traffic will be uneven.

### Daily active users

Daily active users are calculated as:

**DAU = Registered users × Daily activity rate**

= 10,000,000 × 10%

= **1,000,000 daily active users**

Therefore, SnapShare must support approximately one million active users per day.

## 2. Traffic and Storage Estimates

### A. Photo uploads per second

Daily uploads:

1,000,000 active users × 1 photo = **1,000,000 uploads/day**

Average uploads per second:

1,000,000 ÷ 86,400 = **11.57 uploads/second**

Peak uploads per second:

11.57 × 5 = **57.87 uploads/second**

The system should therefore handle approximately 12 uploads per second on average and 58 uploads per second during peak periods, with additional capacity for unexpected traffic spikes.

### B. Feed views per second

Daily feed-page views:

1,000,000 active users × 50 views = **50,000,000 feed views/day**

Average feed views per second:

50,000,000 ÷ 86,400 = **578.70 views/second**

Peak feed views per second:

578.70 × 5 = **2,893.52 views/second**

SnapShare should therefore handle approximately 579 feed requests per second on average and 2,894 per second at peak. The feed service needs to scale independently from the upload service because their workloads differ significantly.

### C. Photo storage per year

Original photo storage per day:

1,000,000 photos × 2 MB = **2,000,000 MB/day = 2 TB/day**

Thumbnail storage per day:

1,000,000 × 50 KB = **50,000,000 KB/day = 50 GB/day**

Total media storage per day:

2 TB + 0.05 TB = **2.05 TB/day**

Annual original photo storage:

2 TB × 365 = **730 TB/year**

Annual thumbnail storage:

0.05 TB × 365 = **18.25 TB/year**

Total annual media storage:

730 TB + 18.25 TB = **748.25 TB/year**

| Storage type | Estimated storage per year |
|---|---:|
| Original photos | 730 TB |
| Thumbnails | 18.25 TB |
| **Total media** | **748.25 TB** |

This is approximately 0.75 petabytes of new media annually, before accounting for backups, replicas, retention policies, and other storage overhead. The estimate assumes the stated upload rate remains constant throughout the year.

## 3. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is **read-heavy**.

The system receives 50 million feed-page views daily compared with one million photo uploads daily. That is approximately **50 feed views for every photo upload**, based on these workload assumptions.

This difference influences the architecture:

- Feed requests should be served through a CDN and application cache wherever possible.
- Database reads can be distributed to read replicas to reduce pressure on the primary database.
- Uploads should write photo files directly to object storage rather than passing large file contents through application servers unnecessarily.
- Thumbnail generation should happen asynchronously so image processing does not delay the upload response.
- Application servers should scale horizontally to handle changes in traffic.

The design prioritises fast feed delivery while maintaining reliable photo uploads and background processing.

## 4. Where Should Photos Be Stored?

Photo files should be stored in **object storage**, not directly inside the relational database.

Storing images as database BLOBs would increase database size, backup time, storage costs, and the workload placed on a database that should primarily manage structured information. Large media files are better suited to services designed for durable, scalable object storage.

Object storage holds original photos and generated thumbnails. The relational database stores metadata such as the photo ID, owner ID, object key, upload timestamp, visibility settings, and processing status.

This separation allows SnapShare to scale media storage independently from user accounts, follows, and feed metadata. A CDN can then cache publicly accessible or appropriately authorised media close to users, reducing latency and repeated requests to the origin storage.

## 5. Proposed Architecture

The following diagram illustrates the major components and the paths taken by feed requests and photo uploads.

```text
                         SNAPSHARE CLIENTS
                       (Web and Mobile Apps)
                                |
                         HTTPS / API Calls
                                |
                    +-----------------------+
                    | CDN / Edge Cache      |
                    | Cached images and     |
                    | thumbnails            |
                    +-----------------------+
                         |             |
                    Media cache     Cache miss /
                                   API request
                                       |
                             +-------------------+
                             | Load Balancer     |
                             | Routes API traffic|
                             +-------------------+
                                       |
                         +-------------+-------------+
                         |                           |
                  +-------------+             +-------------+
                  | App Server  |             | App Server  |
                  | Instance A  |             | Instance B  |
                  +-------------+             +-------------+
                         |                           |
                         +-------------+-------------+
                                       |
                         +-------------------------+
                         | Application Cache      |
                         | Redis-compatible cache |
                         +-------------------------+
                                       |
                         +-------------------------+
                         | Primary Relational DB   |
                         | Users, follows, photo   |
                         | metadata and feed data  |
                         +-------------------------+
                                       |
                         Replication of database data
                                       |
                         +-------------------------+
                         | Read Replica            |
                         | Feed and metadata reads |
                         +-------------------------+

 PHOTO UPLOAD PATH
 -----------------

 Client -----> App Server -----> Object Storage
                    |             Original photos
                    |             and thumbnails
                    |
                    +-----> Job Queue
                               |
                        +--------------+
                        | Thumbnail    |
                        | Worker(s)    |
                        +--------------+
                               |
                       Read original photo
                       from object storage
                               |
                       Resize / compress
                               |
                       Save thumbnail to
                       object storage
                               |
                       Update photo metadata
                       and processing status
```

The CDN, object storage, queue, and worker are separate services. The diagram is logical: an implementation may use managed cloud services rather than operating every component directly.

## 6. Components and the Problems They Solve

1. **Client applications:** Allow users to upload photos, follow accounts, and browse their feeds through a web or mobile interface.

2. **CDN (Content Delivery Network):** Caches frequently accessed photos and thumbnails near users, reducing latency, bandwidth costs, and requests reaching the origin.

3. **Load balancer:** Distributes incoming API requests across healthy application-server instances to avoid overloading one server.

4. **Application servers:** Handle authentication, authorisation, upload coordination, feed generation, metadata operations, and other business logic.

5. **Application cache:** Stores frequently requested feed data, follow relationships, and other reusable results to reduce database load and response times.

6. **Primary relational database:** Stores structured and consistent data, including users, follow relationships, photo metadata, visibility settings, and processing status.

7. **Database read replica:** Serves eligible read queries, especially feed and metadata reads, reducing the workload on the primary database while accepting that replication may introduce slight delays.

8. **Object storage:** Stores original photos and thumbnails durably and scales independently of the relational database.

9. **Job queue:** Holds thumbnail-generation tasks until workers can process them, absorbing bursts of uploads and separating upload requests from image-processing work.

10. **Thumbnail workers:** Consume queued jobs, resize and compress original photos, generate thumbnails, save them to object storage, and update processing status.

11. **Monitoring and alerting:** Tracks latency, error rates, queue depth, storage growth, and resource utilisation so operators can detect problems before they cause widespread service disruption.

12. **Identity and access controls:** Protect accounts and private media through authenticated requests, authorisation checks, short-lived signed upload or download URLs where appropriate, and least-privilege service permissions.

## 7. Step-by-Step Photo Upload Flow

1. **User authentication:** The user signs in, and the application verifies that the user is authorised to upload a photo.

2. **Upload initialisation:** The client requests permission to upload a photo. The application validates the request, creates a photo ID and metadata record, and issues a short-lived, restricted upload URL when supported.

3. **Direct upload:** The client uploads the original photo directly to object storage using the authorised URL. This reduces the amount of large-file traffic passing through application servers.

4. **Upload confirmation:** After the object is stored successfully, the application verifies the upload and records its object key and initial processing status.

5. **Queue submission:** The application places a thumbnail-generation job on the queue. The job includes the photo ID and object key rather than embedding the full image.

6. **Immediate response:** The client receives an upload confirmation while the thumbnail is being generated. The photo may be marked as processing until its thumbnail and required metadata are ready.

7. **Worker processing:** A thumbnail worker consumes the job, retrieves the original photo, validates it, resizes and compresses it, and produces the 50 KB target thumbnail where achievable.

8. **Thumbnail storage:** The worker writes the generated thumbnail to object storage using a separate object key. Failures can be retried, with dead-letter handling for jobs that repeatedly fail.

9. **Metadata update:** The worker marks processing as complete and updates the photo record. The application can then expose the photo in the appropriate feed according to its visibility and publication rules.

10. **Feed delivery:** When followers request their feeds, the application retrieves relevant metadata, uses caching and database reads as appropriate, and returns media URLs. The CDN serves cached thumbnails or photos and retrieves uncached objects from the origin.

The queue makes thumbnail generation independent of the upload request. This improves responsiveness and allows the worker pool to scale according to queue depth.

## 8. Scalability, Reliability, and Security Considerations

- **Horizontal scaling:** Add application-server instances when CPU usage, request volume, or latency rises, and scale thumbnail workers separately according to queue backlog.
- **Stateless application servers:** Store durable application data in databases and object storage rather than local server disks, allowing instances to be replaced or scaled without losing user data.
- **Cache invalidation:** Expire or invalidate cached feed data when relevant posts, follows, or privacy settings change. Use short-lived caching or versioned object keys where appropriate.
- **Database resilience:** Back up the primary database, monitor replica lag, and maintain a tested recovery procedure. A read replica is not a substitute for a backup.
- **Queue reliability:** Use durable messages, bounded retries, idempotent workers, and a dead-letter queue so temporary failures do not permanently lose thumbnail jobs.
- **Media security:** Validate file types and sizes, scan uploads where appropriate, enforce visibility rules, and prevent private images from becoming publicly accessible through incorrectly configured CDN caching.
- **Observability:** Monitor p95/p99 latency, HTTP error rates, cache hit ratio, database connections, replica lag, queue age, and thumbnail-processing failures.
- **Cost control:** Apply storage lifecycle policies to eligible older media, use appropriate image formats and compression, and track CDN egress and object-storage usage.

## 9. Trade-Offs

### Trade-off 1: Caching vs. Freshness

Caching feeds and media reduces database load and improves response times, but cached data can become stale after a new upload, follow change, or privacy update. SnapShare should use explicit invalidation or short time-to-live values for mutable feed data, while versioned media URLs can make image caching more predictable.

### Trade-off 2: Asynchronous Processing vs. Immediate Availability

Generating thumbnails in a background worker makes uploads faster and absorbs traffic spikes, but a photo may not be immediately ready for display. SnapShare can show a processing state and publish the photo only when required processing is complete.

### Trade-off 3: Read Replicas vs. Strong Read Consistency

Read replicas increase read capacity, but replication lag can cause a recently uploaded photo or updated profile to be temporarily absent from a feed. The application can read critical updates from the primary database and use replicas for less time-sensitive queries.

### Trade-off 4: Direct-to-Object-Storage Uploads vs. Centralised Upload Processing

Direct uploads reduce application-server bandwidth and allow media storage to scale independently, but require secure upload URLs, upload validation, and careful handling of incomplete uploads. Restricting permissions, validating completed objects, and cleaning up abandoned uploads help manage these risks.

### Trade-off 5: Storage Redundancy vs. Cost

Replicating or backing up media improves durability and recovery, but increases storage and operational costs. SnapShare should choose storage redundancy, backup retention, and disaster-recovery targets according to business requirements rather than replicating every object without a defined purpose.

## 10. Conclusion

SnapShare's estimated workload is one million daily active users, approximately 11.57 photo uploads per second on average, and 578.70 feed-page views per second on average. Annual original-photo and thumbnail storage is approximately 748.25 TB under the stated assumptions.

Because feed reads significantly outnumber uploads, the design prioritizes CDN delivery, application caching, horizontal scaling, and database read replicas. Object storage handles the large media files, while a queue and asynchronous thumbnail workers keep image processing separate from the upload request.

Together, these components provide a scalable foundation that can grow with user activity while balancing performance, reliability, security, and cost.