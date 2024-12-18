CREATE DEFINER=`root`@`localhost` FUNCTION `calculate_distance`(
    lat1 DOUBLE,  -- φ₁ (phi1) trong công thức
    lon1 DOUBLE,  -- λ₁ (lambda1) trong công thức
    lat2 DOUBLE,  -- φ₂ (phi2) trong công thức
    lon2 DOUBLE   -- λ₂ (lambda2) trong công thức
) RETURNS double
    DETERMINISTIC
BEGIN
    DECLARE R DOUBLE DEFAULT 6371;  -- Bán kính Trái Đất (km)
    DECLARE dlat DOUBLE;  -- Δφ (phi2 - phi1)
    DECLARE dlon DOUBLE;  -- Δλ (lambda2 - lambda1)
    DECLARE a DOUBLE;     -- sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2)
    DECLARE c DOUBLE;     -- 2 × arcsin(√a)

    -- Chuyển từ độ sang radian vì hàm sin/cos trong SQL làm việc với radian
    SET lat1 = radians(lat1);  -- φ₁
    SET lon1 = radians(lon1);  -- λ₁
    SET lat2 = radians(lat2);  -- φ₂
    SET lon2 = radians(lon2);  -- λ₂

    -- Tính hiệu của các góc
    SET dlat = lat2 - lat1;    -- Δφ = φ₂ - φ₁
    SET dlon = lon2 - lon1;    -- Δλ = λ₂ - λ₁

    -- Áp dụng công thức Haversine
    SET a = POW(SIN(dlat/2), 2) +                  -- sin²(Δφ/2)
            COS(lat1) * COS(lat2) *                -- cos(φ₁)cos(φ₂)
            POW(SIN(dlon/2), 2);                   -- sin²(Δλ/2)

    SET c = 2 * ASIN(SQRT(a));  -- 2 × arcsin(√a)

    -- Nhân với bán kính Trái Đất để được khoảng cách
    RETURN R * c;               -- d = R × c
END
