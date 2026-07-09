import Review from "../models/reviews.model.js";
import Tour from "../models/tours.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Lấy danh sách đánh giá của tour
export const getReviewsByTour = asyncHandler(async (req, res) => {
    const { tourId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments({ tourId });
    const reviews = await Review.find({ tourId })
        .populate("userId", "name avatar email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Map to frontend structure if necessary (converting userId field to user field)
    const formattedReviews = reviews.map(review => ({
        _id: review._id,
        user: review.userId, // client expects "user" property instead of "userId"
        tour: review.tourId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
    }));

    return res.status(200).json({
        success: true,
        data: formattedReviews,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// Thêm đánh giá mới
export const createReview = asyncHandler(async (req, res) => {
    const { tourId, rating, comment } = req.body;
    const userId = req.user._id; // set by protect middleware

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: "Điểm đánh giá phải từ 1 đến 5 sao."
        });
    }

    // Kiểm tra xem tour có tồn tại không
    const tour = await Tour.findById(tourId);
    if (!tour) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy Tour này."
        });
    }

    // Tạo review mới
    const review = await Review.create({
        userId,
        tourId,
        rating,
        comment
    });

    // Tính lại rating trung bình và reviewCount của Tour
    const stats = await Review.aggregate([
        { $match: { tourId: tour._id } },
        {
            $group: {
                _id: '$tourId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].nRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            rating: 0,
            reviewCount: 0
        });
    }

    // Populate user info for frontend response
    const populatedReview = await review.populate("userId", "name avatar");

    const formattedReview = {
        _id: populatedReview._id,
        user: populatedReview.userId,
        tour: populatedReview.tourId,
        rating: populatedReview.rating,
        comment: populatedReview.comment,
        createdAt: populatedReview.createdAt,
        updatedAt: populatedReview.updatedAt
    };

    return res.status(201).json({
        success: true,
        message: "Cảm ơn bạn đã đánh giá!",
        data: formattedReview
    });
});

// Xóa đánh giá
export const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy đánh giá."
        });
    }

    // Chỉ có người viết đánh giá hoặc admin mới được xóa
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Bạn không có quyền xóa đánh giá này."
        });
    }

    const tourId = review.tourId;
    await Review.findByIdAndDelete(id);

    // Tính lại rating trung bình
    const stats = await Review.aggregate([
        { $match: { tourId } },
        {
            $group: {
                _id: '$tourId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].nRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            rating: 0,
            reviewCount: 0
        });
    }

    return res.status(200).json({
        success: true,
        message: "Đã xóa đánh giá thành công."
    });
});
