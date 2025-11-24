-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary', 'other');
CREATE TYPE notification_type AS ENUM ('match', 'message', 'like', 'system');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned', 'suspended');

-- Create indexes for better performance
-- These will be created by TypeORM, but we can add additional ones here if needed

-- Create function for calculating distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    dlat float;
    dlon float;
    a float;
    c float;
    earth_radius float := 6371; -- Earth's radius in kilometers
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Create function for geohash encoding (simplified version)
-- In production, you might want to use a proper geohash library
CREATE OR REPLACE FUNCTION encode_geohash(lat float, lon float, "precision" int DEFAULT 7)
RETURNS text AS $$
-- This is a simplified implementation. Consider using a proper geohash library for production
DECLARE
    geohash text := '';
    lat_min float := -90;
    lat_max float := 90;
    lon_min float := -180;
    lon_max float := 180;
    mid float;
    i int;
    bit int := 0;
    ch int;
    even boolean := true;
BEGIN
    -- Simplified geohash implementation
    -- For production, consider using PostgreSQL extensions or external libraries
    FOR i IN 1.."precision"*5 LOOP
        IF even THEN
            mid := (lon_min + lon_max) / 2;
            IF lon > mid THEN
                lon_min := mid;
                bit := 1;
            ELSE
                lon_max := mid;
                bit := 0;
            END IF;
        ELSE
            mid := (lat_min + lat_max) / 2;
            IF lat > mid THEN
                lat_min := mid;
                bit := 1;
            ELSE
                lat_max := mid;
                bit := 0;
            END IF;
        END IF;

        ch := (i-1) % 5;
        geohash := geohash || CASE WHEN bit = 1 THEN '1' ELSE '0' END;

        even := NOT even;
    END LOOP;

    -- Convert binary to base32 (simplified)
    RETURN encode_geohash_base32(geohash);
END;
$$ LANGUAGE plpgsql;

-- Helper function for base32 encoding (simplified)
CREATE OR REPLACE FUNCTION encode_geohash_base32(binary_str text)
RETURNS text AS $$
DECLARE
    base32_chars text := '0123456789bcdefghjkmnpqrstuvwxyz';
    result text := '';
    i int;
    val int;
BEGIN
    FOR i IN 0..length(binary_str)/5-1 LOOP
        val := 0;
        val := val + CASE WHEN substr(binary_str, i*5+1, 1) = '1' THEN 16 ELSE 0 END;
        val := val + CASE WHEN substr(binary_str, i*5+2, 1) = '1' THEN 8 ELSE 0 END;
        val := val + CASE WHEN substr(binary_str, i*5+3, 1) = '1' THEN 4 ELSE 0 END;
        val := val + CASE WHEN substr(binary_str, i*5+4, 1) = '1' THEN 2 ELSE 0 END;
        val := val + CASE WHEN substr(binary_str, i*5+5, 1) = '1' THEN 1 ELSE 0 END;
        result := result || substr(base32_chars, val+1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;