import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tour from './models/tours.model.js';
import Departure from './models/departures.model.js';
import Promotion from './models/promotions.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myProject";

const tours = [
  {
    title: "Tour Vịnh Hạ Long - Đảo Tuần Châu 3 Ngày 2 Đêm",
    slug: "vinh-ha-long-tuan-chau-3n2d",
    description: "Khám phá kỳ quan thiên nhiên thế giới Vịnh Hạ Long với du thuyền 5 sao sang trọng. Hành trình đưa du khách đi qua các địa danh nổi tiếng như Hang Sửng Sốt, Đảo Ti Tốp, Chèo thuyền Kayak tại Hang Luồn và thưởng thức ẩm thực hải sản đặc sắc miền biển.",
    highlights: [
      "Trải nghiệm du thuyền 5 sao sang trọng giữa lòng di sản thiên nhiên thế giới Vịnh Hạ Long",
      "Khám phá Hang Sửng Sốt - một trong những hang động đẹp và lớn nhất Vịnh Hạ Long",
      "Tự do chèo thuyền kayak khám phá Hang Luồn kỳ bí hoặc đi đò nan",
      "Chinh phục đỉnh núi Ti Tốp, ngắm toàn cảnh Vịnh Hạ Long từ trên cao",
      "Thưởng thức bữa tiệc hoàng hôn Sunset Party và lớp học nấu ăn trên du thuyền"
    ],
    destination: "Quảng Ninh",
    departureFrom: "Hà Nội",
    duration: {
      days: 3,
      nights: 2
    },
    type: "domestic",
    maxGroupSize: 20,
    minGroupSize: 5,
    price: {
      adult: 3450000,
      child: 2400000,
      infant: 500000,
      singleRoomSurcharge: 1200000
    },
    includes: [
      "Xe đưa đón khứ hồi Hà Nội - Hạ Long chất lượng cao",
      "Vé thắng cảnh và vé ngủ đêm trên vịnh",
      "Phòng nghỉ sang trọng trên du thuyền 5 sao (tiêu chuẩn 2 người/phòng)",
      "Các bữa ăn theo chương trình (3 bữa trưa, 2 bữa tối, 2 bữa sáng)",
      "Chèo thuyền kayak hoặc đò nan tại Hang Luồn",
      "Hướng dẫn viên tiếng Anh - tiếng Việt nhiệt tình, kinh nghiệm",
      "Nước uống đón chào và bảo hiểm du lịch trên tàu"
    ],
    excludes: [
      "Thuế VAT 10%",
      "Đồ uống gọi thêm trong các bữa ăn và chi phí cá nhân khác",
      "Tiền tip (bồi dưỡng) cho tài xế và hướng dẫn viên",
      "Phụ thu phòng đơn (nếu yêu cầu phòng riêng)"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Vịnh Hạ Long - Hang Sửng Sốt",
        description: "08:00 - Xe đón quý khách tại khu vực Phố Cổ Hà Nội khởi hành đi Hạ Long. 12:00 - Đến cảng tàu, làm thủ tục lên du thuyền, thưởng thức nước uống chào mừng và nghe hướng dẫn an toàn. 13:00 - Thưởng thức bữa trưa buffet hải sản trong khi tàu du ngoạn qua các đảo đá vôi tuyệt đẹp. 15:00 - Hướng dẫn viên đưa đoàn đi tham quan Hang Sửng Sốt - hang động rộng và đẹp nhất vịnh. 16:30 - Tắm biển hoặc leo núi chụp ảnh tại Đảo Ti Tốp. 18:30 - Tham gia Sunset Party và lớp học nấu ăn trên boong tàu. 19:30 - Thưởng thức bữa tối tối lãng mạn tại nhà hàng của du thuyền. Buổi tối quý khách tự do câu mực, xem phim hoặc hát karaoke.",
        meals: {
          breakfast: false,
          lunch: true,
          dinner: true
        },
        accommodation: "Du thuyền 5 sao Hạ Long Cruise"
      },
      {
        day: 2,
        title: "Khám Phá Hang Luồn - Chèo Thuyền Kayak - Đảo Tuần Châu",
        description: "06:30 - Tập Thái Cực Quyền (Tai Chi) trên boong tàu ngắm bình minh. 07:30 - Ăn sáng nhẹ với trà, cà phê và bánh ngọt. 08:30 - Tàu di chuyển đến khu vực Hang Luồn. Quý khách tự do chèo thuyền kayak hoặc ngồi đò nan do người dân địa phương chèo để ngắm nhìn những chú khỉ hoang dã. 10:30 - Trở lại du thuyền làm thủ tục trả phòng và dùng bữa trưa sớm. 12:00 - Du thuyền cập bến, xe đưa quý khách về khách sạn tại Đảo Tuần Châu nhận phòng nghỉ ngơi. Chiều quý khách tự do vui chơi tại bãi biển Tuần Châu hoặc tham gia các trò chơi tại công viên giải trí Tuần Châu Park. 19:00 - Ăn tối tại nhà hàng và tự do khám phá Tuần Châu về đêm.",
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true
        },
        accommodation: "Khách sạn 4 sao Tuần Châu Resort"
      },
      {
        day: 3,
        title: "Tuần Châu - Hà Nội",
        description: "08:00 - Ăn sáng tại khách sạn. Quý khách tự do tắm biển, đi chợ mua sắm hải sản và quà lưu niệm. 11:30 - Làm thủ tục trả phòng khách sạn, dùng bữa trưa tại nhà hàng địa phương. 13:00 - Xe đón quý khách trở về Hà Nội. 16:30 - Xe về đến Hà Nội, kết thúc chương trình du lịch Vịnh Hạ Long - Tuần Châu đầy thú vị.",
        meals: {
          breakfast: true,
          lunch: true,
          dinner: false
        },
        accommodation: "Không bao gồm"
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewCount: 15,
    isActive: true,
    isFeatured: true,
    tags: ["Hạ Long", "Du thuyền", "Hải sản", "Nghỉ dưỡng"]
  },
  {
    title: "Tour Khám Phá Nhật Bản: Tokyo - Mount Fuji - Kyoto - Osaka 6 Ngày 5 Đêm",
    slug: "kham-pha-nhat-ban-tokyo-fuji-kyoto-osaka-6n5d",
    description: "Hành trình đưa quý khách khám phá xứ sở Hoa Anh Đào xinh đẹp, kết hợp giữa sự hiện đại sầm uất của Tokyo và nét cổ kính trầm mặc của cố đô Kyoto, Osaka. Chiêm ngưỡng biểu tượng linh thiêng Núi Phú Sĩ, check-in tại các điểm đến nổi tiếng nhất Nhật Bản.",
    highlights: [
      "Chiêm ngưỡng Núi Phú Sĩ - biểu tượng linh thiêng cao nhất Nhật Bản",
      "Khám phá Hoàng cung Tokyo cổ kính và khu phố điện tử Akihabara sầm uất",
      "Ghé thăm Chùa vàng Kinkaku-ji lấp lánh và rừng tre Sagano kỳ vĩ tại Kyoto",
      "Trải nghiệm tàu cao tốc Shinkansen - biểu tượng tốc độ công nghệ của Nhật Bản",
      "Tự do mua sắm và thưởng thức ẩm thực đường phố tại khu Dotonbori, Osaka"
    ],
    destination: "Nhật Bản",
    departureFrom: "TP. Hồ Chí Minh",
    duration: {
      days: 6,
      nights: 5
    },
    type: "international",
    maxGroupSize: 30,
    minGroupSize: 10,
    price: {
      adult: 29900000,
      child: 24500000,
      infant: 5000000,
      singleRoomSurcharge: 8500000
    },
    includes: [
      "Vé máy bay khứ hồi TP.HCM - Tokyo // Osaka - TP.HCM bao gồm thuế phí hành lý ký gửi",
      "Khách sạn tiêu chuẩn 3-4 sao (tiêu chuẩn 2 khách/phòng, lẻ ghép 3)",
      "Visa nhập cảnh Nhật Bản theo đoàn",
      "Các bữa ăn tiêu chuẩn cao cấp theo chương trình (bao gồm bò Kobe, lẩu Shabu Shabu)",
      "Vé tàu cao tốc Shinkansen trải nghiệm thực tế",
      "Vé tham quan các địa điểm theo chương trình du lịch",
      "Hướng dẫn viên suốt tuyến từ Việt Nam và HDV địa phương tại Nhật Bản",
      "Bảo hiểm du lịch quốc tế hạn mức lên tới 1 tỷ đồng"
    ],
    excludes: [
      "Chi phí cá nhân: điện thoại, giặt ủi, đồ uống ngoài chương trình",
      "Tiền tip bắt buộc cho HDV và tài xế: 42 USD/khách/toàn tour",
      "Phụ thu phòng đơn nếu yêu cầu ở phòng riêng"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Tokyo (Nghỉ Đêm Trên Máy Bay)",
        description: "Quý khách tập trung tại sân bay quốc tế Tân Sơn Nhất, hướng dẫn viên đón đoàn làm thủ tục đáp chuyến bay đi Tokyo. Quý khách nghỉ đêm trên máy bay đầy đủ tiện nghi.",
        meals: {
          breakfast: false,
          lunch: false,
          dinner: false
        },
        accommodation: "Trên máy bay"
      },
      {
        day: 2,
        title: "Khám Phá Thủ Đô Tokyo Hiện Đại",
        description: "Đoàn hạ cảnh tại sân bay Tokyo. Xe đưa đoàn đi tham quan Chùa cổ Asakusa Sensoji cổ kính nhất Tokyo. Tiếp tục chụp hình lưu niệm bên ngoài Tháp truyền hình Tokyo Skytree và Hoàng Cung Tokyo. Buổi chiều đoàn tham quan khu mua sắm điện tử Akihabara sầm uất. Ăn tối và nghỉ ngơi tại khách sạn Tokyo.",
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true
        },
        accommodation: "Khách sạn Tokyo Sunshine Hotel"
      },
      {
        day: 3,
        title: "Tokyo - Núi Phú Sĩ - Làng Cổ Oshino Hakkai",
        description: "Ăn sáng tại khách sạn, đoàn khởi hành đi khu du lịch Núi Phú Sĩ. Lên trạm số 5 (nếu thời tiết cho phép) ngắm nhìn ngọn núi hùng vĩ. Chiều đoàn tham quan ngôi làng cổ Oshino Hakkai yên bình dưới chân núi Phú Sĩ. Trải nghiệm tắm suối khoáng nóng Onsen truyền thống của Nhật Bản giúp thư giãn cơ thể. Ăn tối với lẩu cua tuyết đặc sản.",
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true
        },
        accommodation: "Khách sạn Fuji Onsen Resort"
      },
      {
        day: 4,
        title: "Trải Nghiệm Tàu Shinkansen - Cố Đô Kyoto Cổ Kính",
        description: "Đoàn di chuyển bằng tàu cao tốc Shinkansen đến ga Kyoto. Tham quan Chùa Vàng Kinkaku-ji độc đáo được dát vàng lá nổi bật giữa hồ nước trong xanh. Khám phá con đường Rừng Tre Sagano Arashiyama thơ mộng rầm rì tiếng gió. Di chuyển về Osaka nhận phòng khách sạn.",
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true
        },
        accommodation: "Khách sạn Osaka Central Hotel"
      },
      {
        day: 5,
        title: "Lâu Đài Osaka - Mua Sắm Dotonbori - Thưởng Thức Bò Kobe",
        description: "Tham quan và chụp hình bên ngoài Lâu đài Osaka nguy nga cổ kính. Chiều đoàn tự do mua sắm tại phố Shinsaibashi và thưởng thức đồ ăn tại Dotonbori với các món bánh bạch tuộc Takoyaki, bánh xèo Okonomiyaki ngon tuyệt. Bữa tối quý khách được thưởng thức thịt bò Kobe nướng nổi tiếng thế giới tại nhà hàng cao cấp.",
        meals: {
          breakfast: true,
          lunch: true,
          dinner: true
        },
        accommodation: "Khách sạn Osaka Central Hotel"
      },
      {
        day: 6,
        title: "Osaka - TP.HCM",
        description: "Ăn sáng tại khách sạn, làm thủ tục trả phòng. Xe đưa đoàn ra sân bay Kansai đón chuyến bay trở về TP. Hồ Chí Minh. Kết thúc chuyến đi khám phá Nhật Bản tốt đẹp.",
        meals: {
          breakfast: true,
          lunch: false,
          dinner: false
        },
        accommodation: "Không bao gồm"
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewCount: 42,
    isActive: true,
    isFeatured: true,
    tags: ["Nhật Bản", "Kobe", "Núi Phú Sĩ", "Kyoto", "Onsen"]
  },
  {
    title: "Tour Chinh Phục Đỉnh Fansipan - Sapa Bản Cát Cát 2 Ngày 1 Đêm",
    slug: "chinh-phuc-fansipan-sapa-cat-cat-2n1d",
    description: "Hành trình ngắn ngày nhưng vô cùng đặc sắc đưa du khách đến với thị trấn trong sương Sapa. Trải nghiệm ngồi cáp treo hiện đại chinh phục đỉnh Fansipan - nóc nhà Đông Dương huyền thoại và ghé thăm bản Cát Cát, tìm hiểu đời sống văn hóa của đồng bào H'Mông.",
    highlights: [
      "Chinh phục đỉnh núi Fansipan cao 3.143m bằng cáp treo 3 dây hiện đại nhất thế giới",
      "Check-in cột mốc 'Nóc nhà Đông Dương' và chiêm bái quần thể tâm linh trên đỉnh Fansipan",
      "Ghé thăm Bản Cát Cát mộc mạc, chụp ảnh cùng thác nước và những guồng nước gỗ",
      "Khám phá thị trấn Sapa mờ sương, check-in nhà thờ đá cổ kính độc đáo",
      "Thưởng thức nồi lẩu cá hồi, cá tầm tươi ngon trứ danh vùng cao tây bắc"
    ],
    destination: "Sapa",
    departureFrom: "Hà Nội",
    duration: {
      days: 2,
      nights: 1
    },
    type: "adventure",
    maxGroupSize: 15,
    minGroupSize: 4,
    price: {
      adult: 2150000,
      child: 1600000,
      infant: 300000,
      singleRoomSurcharge: 500000
    },
    includes: [
      "Xe giường nằm khứ hồi chất lượng cao Hà Nội - Sapa",
      "Khách sạn 3 sao trung tâm Sapa (2 người/phòng)",
      "Vé tham quan Bản Cát Cát theo lịch trình",
      "Xe đưa đón các điểm tham quan tại Sapa",
      "Các bữa ăn chính (3 bữa chính bao gồm lẩu cá hồi, 1 bữa sáng buffet)",
      "Hướng dẫn viên chuyên nghiệp, chu đáo phục vụ đoàn tại Sapa"
    ],
    excludes: [
      "Vé cáp treo Fansipan (khoảng 800,000đ/vé người lớn)",
      "Thuế VAT 10% và chi phí cá nhân ngoài chương trình",
      "Tiền típ cho HDV và tài xế xe"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Sapa - Bản Cát Cát",
        description: "06:30 - Xe giường nằm đón quý khách khởi hành đi Sapa theo đường cao tốc Nội Bài - Lào Cai. 12:30 - Xe đến Sapa, hướng dẫn viên đón đoàn về dùng bữa trưa tại nhà hàng, sau đó nhận phòng khách sạn nghỉ ngơi. 14:30 - Đi bộ tham quan Bản Cát Cát của người H'Mông. Khám phá quy trình dệt vải, nhuộm chàm thủ công, ghé thăm nhà cổ và chụp ảnh cùng thác nước Cát Cát. 19:00 - Dùng bữa tối đặc sản lẩu cá hồi Sapa. Buổi tối quý khách tự do tham quan Nhà thờ đá cổ Sapa, chợ tình Sapa (vào tối thứ 7).",
        meals: {
          breakfast: false,
          lunch: true,
          dinner: true
        },
        accommodation: "Khách sạn 3 sao Sapa View Hotel"
      },
      {
        day: 2,
        title: "Cáp Treo Fansipan - Đỉnh Nóc Nhà Đông Dương - Hà Nội",
        description: "07:30 - Dùng bữa sáng buffet tại khách sạn. 08:30 - Xe đưa đoàn ra ga cáp treo Fansipan làm thủ tục đi cáp treo lên đỉnh Fansipan. Quý khách được chiêm ngưỡng thung lũng Mường Hoa thơ mộng từ cabin cáp treo. Chinh phục đỉnh núi cao 3.143m, chụp ảnh với cột mốc thiêng liêng. Chiêm bái Đại Tượng Phật bằng đồng lớn nhất Việt Nam. 11:30 - Trở lại Sapa, làm thủ tục trả phòng khách sạn, dùng bữa trưa. 13:30 - Lên xe giường nằm trở về Hà Nội. 19:30 - Xe về đến điểm hẹn tại Hà Nội. Kết thúc hành trình chinh phục đỉnh Fansipan.",
        meals: {
          breakfast: true,
          lunch: true,
          dinner: false
        },
        accommodation: "Không bao gồm"
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
    ],
    thumbnail: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewCount: 28,
    isActive: true,
    isFeatured: false,
    tags: ["Fansipan", "Sapa", "Trekking", "Leo núi", "Bản Cát Cát"]
  }
];

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(8, 0, 0, 0);
  return date;
};

async function seedDepartures(insertedTours) {
  const departures = insertedTours.flatMap((tour) => [
    {
      tourId: tour._id,
      departureDate: addDays(14),
      returnDate: addDays(14 + tour.duration.days - 1),
      status: "open",
      maxSlots: tour.maxGroupSize || 20,
      bookedSlots: 0
    },
    {
      tourId: tour._id,
      departureDate: addDays(30),
      returnDate: addDays(30 + tour.duration.days - 1),
      status: "open",
      maxSlots: tour.maxGroupSize || 20,
      bookedSlots: 2
    }
  ]);

  await Departure.insertMany(departures);
}

async function seedPromotions() {
  await Promotion.insertMany([
    {
      code: "WELCOME10",
      type: "percent",
      value: 10,
      maxDiscount: 500000,
      minOrderValue: 0,
      applicableTours: [],
      isActive: true
    },
    {
      code: "SUMMER300K",
      type: "fixed",
      value: 300000,
      minOrderValue: 2000000,
      applicableTours: [],
      isActive: true
    }
  ]);
}

async function seedDB() {
  try {
    console.log("Đang kết nối CSDL...");
    await mongoose.connect(MONGO_URI);
    console.log("Kết nối thành công! Đang xóa dữ liệu cũ...");
    await Promise.all([
      Tour.deleteMany({}),
      Departure.deleteMany({}),
      Promotion.deleteMany({})
    ]);
    console.log("Đang chèn dữ liệu tour mẫu mới...");
    const insertedTours = await Tour.insertMany(tours);
    console.log("Đang chèn lịch khởi hành mẫu...");
    await seedDepartures(insertedTours);
    console.log("Đang chèn mã giảm giá mẫu...");
    await seedPromotions();
    console.log("Khởi tạo dữ liệu mẫu thành công!");
  } catch (error) {
    console.error("Lỗi khi seed dữ liệu:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Đã ngắt kết nối CSDL.");
  }
}

seedDB();
