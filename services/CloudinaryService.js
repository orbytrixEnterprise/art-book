const { cloudinary } = require('../config/cloudinary');

class CloudinaryService {
  /**
   * Upload an image to Cloudinary with specified configuration
   * @param {Buffer} fileBuffer - The image file buffer
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} - Upload result with public_id and secure_url
   */
  async uploadImage(fileBuffer, options = {}) {
    try {
      return new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: options.folder || 'drawing-app/documents',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ],
          ...options
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              resolve({
                cloudinaryId: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format
              });
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      throw new Error(`Image upload error: ${error.message}`);
    }
  }

  /**
   * Delete a single image from Cloudinary
   * @param {String} cloudinaryId - The public_id of the image to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteImage(cloudinaryId) {
    try {
      if (!cloudinaryId) {
        throw new Error('Cloudinary ID is required for deletion');
      }

      const result = await cloudinary.uploader.destroy(cloudinaryId, {
        resource_type: 'image'
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Failed to delete image: ${result.result}`);
      }

      return {
        success: true,
        cloudinaryId,
        result: result.result
      };
    } catch (error) {
      throw new Error(`Image deletion error: ${error.message}`);
    }
  }

  /**
   * Delete multiple images from Cloudinary
   * @param {Array<String>} cloudinaryIds - Array of public_ids to delete
   * @returns {Promise<Object>} - Bulk deletion results
   */
  async deleteBulkImages(cloudinaryIds) {
    try {
      if (!Array.isArray(cloudinaryIds) || cloudinaryIds.length === 0) {
        throw new Error('Array of Cloudinary IDs is required for bulk deletion');
      }

      const deletePromises = cloudinaryIds.map(id => 
        this.deleteImage(id).catch(error => ({
          success: false,
          cloudinaryId: id,
          error: error.message
        }))
      );

      const results = await Promise.allSettled(deletePromises);

      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successful.push(cloudinaryIds[index]);
        } else {
          failed.push({
            cloudinaryId: cloudinaryIds[index],
            error: result.reason?.message || result.value?.error || 'Unknown error'
          });
        }
      });

      return {
        success: true,
        deleted: successful.length,
        failed: failed.length,
        results: {
          successful,
          failed
        }
      };
    } catch (error) {
      throw new Error(`Bulk deletion error: ${error.message}`);
    }
  }
}

module.exports = new CloudinaryService();
