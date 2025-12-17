# Netflix System Design - Complete Flow Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [Core Flows](#core-flows)
6. [Scalability & Performance](#scalability--performance)
7. [Security](#security)

---

## System Overview

### Problem Statement

Design and implement a Netflix-like video streaming platform that supports:
- User registration and authentication
- Video streaming with adaptive bitrate streaming
- Content browsing and search
- Watch history and continue watching
- Personalized content recommendations
- Multiple profiles per account
- Download for offline viewing

### Requirements

**Functional Requirements:**
- Users can register, login, and manage multiple profiles
- Users can browse and search content (movies, TV shows)
- Users can stream videos with adaptive quality based on bandwidth
- Users can view watch history and continue watching
- System provides personalized content recommendations
- Users can download content for offline viewing
- Users can rate and review content

**Non-Functional Requirements:**
- Video start time: < 2 seconds
- Streaming quality: Adaptive based on bandwidth
- System capacity: 200M+ users, 1B+ hours watched/day
- High availability: 99.99% uptime
- Recommendation API: < 100ms response time
- Search API: < 200ms response time
- Watch history update: < 50ms

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│         (Web App, Mobile App, Smart TV, Set-top Box)        │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer                             │
│         (Distributes API requests, SSL termination)         │
└───────────────────────┬───────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   App Server │ │   App Server │ │   App Server │
│   Instance 1 │ │   Instance 2 │ │   Instance N │
│              │ │              │ │              │
│  ┌─────────┐ │ │  ┌─────────┐ │ │  ┌─────────┐ │
│  │   API   │ │ │  │   API   │ │ │  │   API   │ │
│  │ Service │ │ │  │ Service │ │ │  │ Service │ │
│  └────┬────┘ │ │  └────┬────┘ │ │  └────┬────┘ │
│       │      │ │       │      │ │       │      │
│  ┌────┴────┐ │ │  ┌────┴────┐ │ │  ┌────┴────┐ │
│  │  Auth   │ │ │  │Recommend│ │ │  │ Content │ │
│  │ Service │ │ │  │ Service │ │ │  │ Service │ │
│  └─────────┘ │ │  └─────────┘ │ │  └─────────┘ │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │    Redis     │ │   Cassandra  │
│  (Primary)   │ │   (Cache)    │ │  (Watch      │
│              │ │              │ │   History)   │
└──────┬───────┘ └──────────────┘ └──────────────┘
       │
       ▼
┌──────────────┐
│ PostgreSQL   │
│  (Replica)   │
└──────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│              CDN Layer (CloudFront/Cloudflare)              │
│         (Edge Locations - Global Distribution)               │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Edge US  │  │ Edge EU  │  │ Edge APAC│  │ Edge LATAM│   │
│  │ (Video   │  │ (Video   │  │ (Video   │  │ (Video   │   │
│  │ Cache)   │  │ Cache)   │  │ Cache)   │  │ Cache)   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Origin Servers (Video Storage)                 │
│         (AWS S3 / Google Cloud Storage)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Video Encoding & Transcoding Service         │   │
│  │  (FFmpeg / AWS MediaConvert - Multiple Bitrates)    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│         Analytics & ML Services                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Recommendation│  │   Analytics  │  │   Monitoring │     │
│  │   Engine     │  │   Pipeline   │  │   & Logging   │     │
│  │ (TensorFlow/ │  │   (Kafka)    │  │   (ELK Stack) │     │
│  │   PyTorch)   │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │   User       │  │   Content    │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  │              │  │              │  │              │     │
│  │ - Register   │  │ - Profiles   │  │ - Metadata   │     │
│  │ - Login      │  │ - Watch      │  │ - Search     │     │
│  │ - JWT        │  │   History    │  │ - Browse     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│  ┌──────┴─────────────────┴─────────────────┴──────┐     │
│  │         Video Streaming Service                  │     │
│  │                                                  │     │
│  │  - Manifest Generation (HLS/DASH)                │     │
│  │  - Adaptive Bitrate Logic                        │     │
│  │  - Quality Selection                             │     │
│  │  - Segment Delivery                              │     │
│  └───────────────────────┬───────────────────────────┘     │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────────┐     │
│  │         Recommendation Service                      │     │
│  │                                                  │     │
│  │  - Collaborative Filtering                        │     │
│  │  - Content-Based Filtering                        │     │
│  │  - Hybrid Approach                                │     │
│  │  - Real-time Recommendations                      │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Search     │  │   Rating     │  │   Download   │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  │              │  │              │  │              │     │
│  │ - Elasticsearch│ │ - Ratings   │  │ - Offline    │     │
│  │ - Full-text  │  │ - Reviews    │  │   Content    │     │
│  │   Search     │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │    Redis     │ │   Cassandra  │ │   CDN        │
│  Database     │ │    Cache     │ │  (Watch      │ │  (Video      │
│              │ │              │ │   History)   │ │   Content)   │
│ - Users      │ │ - Content    │ │              │ │              │
│ - Profiles   │ │   Metadata   │ │ - Watch      │ │ - Edge Cache  │
│ - Content    │ │ - Recommend- │ │   History    │ │ - Origin     │
│   Metadata   │ │   ations     │ │ - Ratings    │ │   Fetch      │
│ - Ratings    │ │ - Session    │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│         Video Processing & Storage Layer                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Video      │  │   Origin     │  │   Encoding   │     │
│  │   Encoding   │  │   Storage    │  │   Pipeline   │     │
│  │   Pipeline   │  │   (S3/GCS)   │  │              │     │
│  │              │  │              │  │ - Transcoding│     │
│  │ - Transcoding│  │ - Raw Videos │  │ - Multiple   │     │
│  │ - Multiple   │  │ - Encoded    │  │   Bitrates   │     │
│  │   Bitrates   │  │   Segments   │  │ - HLS/DASH   │     │
│  │ - HLS/DASH   │  │ - Manifests  │  │   Manifests  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│         Analytics & ML Infrastructure                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Kafka      │  │   ML         │  │   Monitoring │     │
│  │   (Event     │  │   Training   │  │   & Logging   │     │
│  │   Streaming) │  │   Pipeline   │  │              │     │
│  │              │  │              │  │ - Metrics    │     │
│  │ - User       │  │ - Batch      │  │ - Alerts     │     │
│  │   Events     │  │   Training   │  │ - Dashboards │     │
│  │ - Watch      │  │ - Model      │  │              │     │
│  │   History    │  │   Serving    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Components Description

#### 1. Client Layer
- **Web Application**: React/Vue.js based web client
- **Mobile Apps**: iOS and Android native applications
- **Smart TV Apps**: Applications for various TV platforms (Roku, Apple TV, Android TV)
- **Set-top Box**: Dedicated streaming devices

#### 2. Load Balancer
- Distributes incoming requests across multiple application server instances
- SSL/TLS termination
- Health checks and automatic failover
- Geographic routing for optimal latency

#### 3. Application Servers
- **API Service**: RESTful API endpoints for all client interactions
- **Auth Service**: User authentication, authorization, JWT token management
- **User Service**: Profile management, watch history, user preferences
- **Content Service**: Content metadata management, browsing, search
- **Video Streaming Service**: Manifest generation, adaptive bitrate logic, segment delivery
- **Recommendation Service**: Personalized content recommendations
- **Search Service**: Full-text search using Elasticsearch
- **Rating Service**: User ratings and reviews
- **Download Service**: Offline content management

#### 4. Database Layer
- **PostgreSQL (Primary)**: 
  - User accounts and profiles
  - Content metadata (movies, TV shows, episodes)
  - Ratings and reviews
  - Subscription information
- **PostgreSQL (Replica)**: Read replicas for scaling read operations
- **Cassandra**: 
  - Watch history (time-series data)
  - High write throughput
  - Distributed and fault-tolerant
- **Redis**: 
  - Content metadata cache
  - Pre-computed recommendations
  - Session management
  - Recent watch history cache

#### 5. CDN Layer
- **Edge Locations**: Globally distributed edge servers
- **Cache Strategy**: 
  - Popular content cached at edge (99% cache hit rate)
  - Long-tail content fetched from origin
  - Predictive caching based on ML models
- **Geographic Routing**: Route users to nearest edge location
- **Origin Fetch**: Fallback to origin servers when cache miss

#### 6. Video Storage & Processing
- **Origin Storage**: AWS S3 or Google Cloud Storage
  - Raw video files
  - Encoded video segments
  - Manifest files (M3U8 for HLS, MPD for DASH)
- **Video Encoding Pipeline**:
  - Input: Raw video files
  - Processing: Transcoding to multiple bitrates (240p, 360p, 480p, 720p, 1080p, 4K)
  - Output: HLS/DASH compatible segments and manifests
  - Tools: FFmpeg, AWS MediaConvert, or similar

#### 7. Analytics & ML Services
- **Kafka**: Event streaming for user activity, watch events, analytics
- **ML Training Pipeline**: 
  - Batch training for recommendation models
  - Feature engineering from watch history
  - Model versioning and A/B testing
- **Recommendation Engine**: 
  - Collaborative filtering (user-based, item-based)
  - Content-based filtering
  - Hybrid approach combining both
  - Real-time inference for personalized recommendations
- **Monitoring & Logging**: 
  - ELK Stack (Elasticsearch, Logstash, Kibana)
  - Metrics collection (Prometheus, Grafana)
  - Alerting for system health

---

## Database Design

*[To be implemented in next todo]*

---

## API Design

*[To be implemented in next todo]*

---

## Core Flows

*[To be implemented in next todo]*

---

## Scalability & Performance

*[To be implemented in next todo]*

---

## Security

*[To be implemented in next todo]*
