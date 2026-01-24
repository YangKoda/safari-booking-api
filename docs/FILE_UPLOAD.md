# File Upload Documentation

## Overview

The Safari Booking API supports image uploads for tours and user avatars using AWS S3 storage.

## Endpoints

### Upload Tour Images

**POST** `/api/v1/upload/tours/:tourId/images`

**Authorization:** Admin, Tour Guide
**Content-Type:** `multipart/form-data`
**Field Name:** `images` (array, max 5 files)
**Max File Size:** 5MB per file
**Allowed Types:** JPEG, PNG, WebP

**Processing:**

- Resized to 2000x1333px
- Compressed to JPEG (85% quality)
- Uploaded to S3

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/upload/tours/:tourId/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@tour1.jpg" \
  -F "images=@tour2.jpg"
```

### Upload User Avatar

**POST** `/api/v1/upload/users/avatar`

**Authorization:** Authenticated User
**Content-Type:** `multipart/form-data`
**Field Name:** `image` (single file)
**Max File Size:** 5MB
**Allowed Types:** JPEG, PNG, WebP

**Processing:**

- Resized to 500x500px
- Compressed to JPEG (90% quality)
- Uploaded to S3
- Old avatar automatically deleted

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/upload/users/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@avatar.jpg"
```

### Upload Review Images

**POST** `/api/v1/upload/reviews/:reviewId/images`

**Authorization:** Authenticated User (must own the review)
**Content-Type:** `multipart/form-data`
**Field Name:** `images` (array, max 5 files total per review)
**Max File Size:** 5MB per file
**Allowed Types:** JPEG, PNG, WebP

**Processing:**

- Resized to 1200x800px
- Compressed to JPEG (80% quality)
- Uploaded to S3 in 'reviews' folder

**Business Rules:**

- Maximum 5 images per review total
- User must own the review
- Images are added, not replaced

**Example:**

```bash
# Create review first
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tourId": "tour-uuid",
    "rating": 5,
    "comment": "Amazing safari experience!"
  }'

# Then upload images to that review
curl -X POST http://localhost:3000/api/v1/upload/reviews/REVIEW_ID/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@safari-lions.jpg" \
  -F "images=@safari-elephants.jpg"
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "urls": [
      "https://safari-bookings.s3.amazonaws.com/reviews/1234-uuid.jpg",
      "https://safari-bookings.s3.amazonaws.com/reviews/5678-uuid.jpg"
    ],
    "count": 2
  }
}
```

## Configuration

Environment variables in `.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=safari-booking-images
AWS_S3_BASE_URL=https://safari-booking-images.s3.amazonaws.com
MAX_FILE_SIZE=5242880
MAX_FILES_PER_UPLOAD=5
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

## AWS S3 Setup

1. Create S3 bucket
2. Configure bucket policy for public read
3. Enable CORS if needed
4. Create IAM user with S3 permissions
5. Add credentials to `.env`
