CREATE DATABASE IF NOT EXISTS medicare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medicare;
CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(120) NOT NULL, email VARCHAR(160) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL, phone VARCHAR(30), role ENUM('admin','doctor','patient') NOT NULL DEFAULT 'patient',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS specialties (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, description TEXT
);
CREATE TABLE IF NOT EXISTS facilities (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL, address VARCHAR(255) NOT NULL, phone VARCHAR(30)
);
CREATE TABLE IF NOT EXISTS doctors (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL UNIQUE, specialty_id INT NOT NULL, facility_id INT NOT NULL,
 degree VARCHAR(120), experience VARCHAR(80), bio TEXT, fee DECIMAL(12,2) NOT NULL DEFAULT 0,
 work_days VARCHAR(80) NOT NULL DEFAULT 'T2,T3,T4,T5,T6', start_time TIME NOT NULL DEFAULT '08:00:00', end_time TIME NOT NULL DEFAULT '17:00:00',
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(specialty_id) REFERENCES specialties(id), FOREIGN KEY(facility_id) REFERENCES facilities(id)
);
CREATE TABLE IF NOT EXISTS appointments (
 id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT NOT NULL, doctor_id INT NOT NULL,
 appointment_date DATE NOT NULL, start_time TIME NOT NULL, reason TEXT NOT NULL, fee DECIMAL(12,2) NOT NULL,
 payment_method VARCHAR(80), payment_status VARCHAR(40) DEFAULT 'Chưa thanh toán',
 status ENUM('Chờ xác nhận','Đã xác nhận','Đã hoàn thành','Đã hủy','Bị từ chối') DEFAULT 'Chờ xác nhận',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(patient_id) REFERENCES users(id), FOREIGN KEY(doctor_id) REFERENCES doctors(id),
 active_slot TINYINT GENERATED ALWAYS AS (IF(status IN ('Đã hủy','Bị từ chối'),NULL,1)) STORED,
 UNIQUE KEY uq_doctor_slot (doctor_id,appointment_date,start_time,active_slot)
);
