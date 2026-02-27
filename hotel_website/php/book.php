<?php
require_once 'config.php';

requireLogin();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $room_type = sanitizeInput($_POST['room_type']);
    $check_in = sanitizeInput($_POST['check_in']);
    $check_out = sanitizeInput($_POST['check_out']);

    $errors = [];

    if (empty($room_type)) {
        $errors[] = "Room type is required.";
    }

    if (empty($check_in) || empty($check_out)) {
        $errors[] = "Check-in and check-out dates are required.";
    } else {
        $check_in_date = new DateTime($check_in);
        $check_out_date = new DateTime($check_out);
        $today = new DateTime();

        if ($check_in_date < $today) {
            $errors[] = "Check-in date cannot be in the past.";
        }

        if ($check_out_date <= $check_in_date) {
            $errors[] = "Check-out date must be after check-in date.";
        }
    }

    if (empty($errors)) {
        $conn = getDBConnection();

        $stmt = $conn->prepare("SELECT id, price FROM rooms WHERE room_type = ? AND available = TRUE LIMIT 1");
        $stmt->bind_param("s", $room_type);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $room = $result->fetch_assoc();
            $room_id = $room['id'];
            $price_per_night = $room['price'];

            $nights = $check_in_date->diff($check_out_date)->days;
            $total_price = $nights * $price_per_night;

            $stmt = $conn->prepare("SELECT id FROM bookings WHERE room_id = ? AND ((check_in <= ? AND check_out > ?) OR (check_in < ? AND check_out >= ?)) AND status != 'cancelled'");
            $stmt->bind_param("issss", $room_id, $check_out, $check_in, $check_out, $check_in);
            $stmt->execute();
            $booking_result = $stmt->get_result();

            if ($booking_result->num_rows == 0) {
                $stmt = $conn->prepare("INSERT INTO bookings (user_id, room_id, check_in, check_out, total_price) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("iissd", $_SESSION['user_id'], $room_id, $check_in, $check_out, $total_price);

                if ($stmt->execute()) {
                    header("Location: ../book.html?success=1");
                    exit();
                } else {
                    $errors[] = "Booking failed. Please try again.";
                }
            } else {
                $errors[] = "Room is not available for the selected dates.";
            }
        } else {
            $errors[] = "Selected room type is not available.";
        }

        $stmt->close();
        $conn->close();
    }

    if (!empty($errors)) {
        $error_string = implode("&error[]=", array_map('urlencode', $errors));
        header("Location: ../book.html?error[]=" . $error_string);
        exit();
    }
} else {
    header("Location: ../book.html");
    exit();
}
?>
