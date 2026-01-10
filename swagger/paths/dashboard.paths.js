/**
 * @swagger
 * /api/dashboard/statistics:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieves comprehensive dashboard statistics including document counts, category counts, image counts, most popular categories by document count, and recent documents.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStatistics'
 *             examples:
 *               success:
 *                 summary: Successful response
 *                 value:
 *                   success: true
 *                   data:
 *                     documents:
 *                       total: 45
 *                       active: 38
 *                       inactive: 7
 *                     categories:
 *                       total: 8
 *                       active: 6
 *                       inactive: 2
 *                       withDocuments: 5
 *                     images:
 *                       total: 127
 *                     mostPopularCategories:
 *                       - categoryId: "507f1f77bcf86cd799439011"
 *                         categoryName: "People"
 *                         categorySlug: "people"
 *                         categoryIcon: "👤"
 *                         documentCount: 23
 *                         imageCount: 67
 *                       - categoryId: "507f1f77bcf86cd799439012"
 *                         categoryName: "Nature"
 *                         categorySlug: "nature"
 *                         categoryIcon: "🌿"
 *                         documentCount: 18
 *                         imageCount: 45
 *                       - categoryId: "507f1f77bcf86cd799439013"
 *                         categoryName: "Architecture"
 *                         categorySlug: "architecture"
 *                         categoryIcon: "🏛️"
 *                         documentCount: 12
 *                         imageCount: 28
 *                     recentDocuments:
 *                       - _id: "507f1f77bcf86cd799439020"
 *                         title: "Portrait Study"
 *                         description: "A detailed portrait drawing..."
 *                         category:
 *                           _id: "507f1f77bcf86cd799439011"
 *                           name: "People"
 *                           slug: "people"
 *                           icon: "👤"
 *                         main_image:
 *                           cloudinaryId: "sample_id"
 *                           url: "https://res.cloudinary.com/..."
 *                         createdAt: "2024-01-15T14:30:00.000Z"
 *                     summary:
 *                       totalItems: 53
 *                       lastUpdated: "2024-01-15T16:45:30.123Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

module.exports = {};