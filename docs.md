=======================================================================================================
Thêm category
INSERT INTO `Category` (`id`, `name`, `description`, `icon_url`) VALUES
('CAT001', 'Kiếm hiệp', 'Những câu chuyện về giang hồ và võ thuật.', 'https://example.com/icons/kiem-hiep.png'),
('CAT002', 'Tình cảm', 'Những câu chuyện tình yêu lãng mạn.', 'https://example.com/icons/tinh-cam.png'),
('CAT003', 'Hành động', 'Bạo lực', 'https://example.com/icons/tinh-cam.png'),
('CAT004', 'Thể thao', 'Thể thao mạo hiểm', 'https://example.com/icons/tinh-cam.png');

================================================================================================
Thêm tag
INSERT INTO `Tag` (`id`, `name`) VALUES
(2, 'Bí ẩn'),
(1, 'Hài hước'),
(3, 'Lãng mạn');

=================================================================================================
Thêm Story (Truyện)
INSERT INTO `Story` (`id`, `title`, `author`, `genre_id`, `description`, `cover_image`, `status`, `views`, `rating`, `created_at`, `updated_at`) VALUES
('ST001', 'Kiếm Hiệp Vô Danh', 'Nguyễn Văn A', 'CAT001', 'Một kiếm khách vô danh hành tẩu giang hồ...', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQahi6m2NxEFAgCu-bspjE1YebgGUM8E6X2mA&s', 'Completed', 1500, 4.5, '2025-02-26 18:42:59', '2025-02-27 11:42:57'),
('ST002', 'Tình Yêu Dưới Mưa', 'Trần Thị B', 'CAT002', 'Câu chuyện tình yêu lãng mạn giữa mưa và gió.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQahi6m2NxEFAgCu-bspjE1YebgGUM8E6X2mA&s', 'Ongoing', 800, 4.2, '2025-02-26 18:42:59', '2025-02-26 21:56:14');

================================================================================================
Thêm Chappter ( danh sách chappter)
INSERT INTO `Chapter` (`id`, `story_id`, `chapter_number`, `title`, `release_date`, `views`, `created_at`) VALUES
('CH001', 'ST001', 1, 'Hành trình bắt đầu', '2023-01-01', 500),
('CH002', 'ST001', 2, 'Gặp gỡ kỳ nhân', '2023-01-02', 450),
('CH003', 'ST002', 1, 'Ngày mưa đầu tiên', '2023-02-01', 300),
('CH004', 'ST001', 3, 'Gặp gỡ kỳ nhân 2', '2023-01-02', 450),
('CH005', 'ST001', 4, 'Gặp gỡ kỳ nhân 3', '2023-01-02', 450),
('CH006', 'ST002', 2, 'Ngày mưa thứ 2', '2023-02-01', 300),
('CH007', 'ST002', 3, 'Ngày mưa thứ 3', '2023-02-01', 300);

===================================================================================================
Thêm Ảnh ChappterImage ( danh sách ảnh chappter)
INSERT INTO `ChapterImage` (`id`, `chapter_id`, `image_url`, `order`, `description`) VALUES
(1, 'CH001', 'https://truyenthieunhi.net/wp-content/uploads/2025/02/truyen-tranh-ho-nuoc-va-may-1-e1740485779699.jpg', 1, 'Cảnh kiếm khách dưới trăng'),
(2, 'CH001', 'https://truyenthieunhi.net/wp-content/uploads/2025/02/truyen-tranh-ho-nuoc-va-may-1-e1740485779699.jpg', 2, 'Cuộc chiến đầu tiên'),
(3, 'CH002', 'https://truyenthieunhi.net/wp-content/uploads/2025/02/truyen-tranh-ho-nuoc-va-may-1-e1740485779699.jpg', 1, 'Lão đạo sĩ xuất hiện'),
(4, 'CH003', 'https://truyenthieunhi.net/wp-content/uploads/2025/02/truyen-tranh-ho-nuoc-va-may-1-e1740485779699.jpg', 1, 'Cô gái dưới mưa'),
(5, 'CH003', 'https://truyenthieunhi.net/wp-content/uploads/2025/02/truyen-tranh-ho-nuoc-va-may-1-e1740485779699.jpg', 2, 'Cô gái dưới mưa'),
(6, 'CH003', 'https://truyenthieunhi.net/wp-content/uploads/2025/02/truyen-tranh-ho-nuoc-va-may-1-e1740485779699.jpg', 3, 'Cô gái dưới mưa '),
(7, 'CH003', 'https://truyenthieunhi.net/wp-content/uploads/2025/02/truyen-tranh-ho-nuoc-va-may-1-e1740485779699.jpg', 4, 'Cô gái dưới mưa ');
