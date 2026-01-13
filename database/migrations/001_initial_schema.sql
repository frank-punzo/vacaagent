-- VacaAgent Database Schema
-- PostgreSQL 16

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vacations table
CREATE TABLE vacations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    vibe VARCHAR(100),
    created_by VARCHAR(255) NOT NULL,  -- Cognito user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Vacation members table
CREATE TABLE vacation_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,  -- Cognito user ID
    role VARCHAR(50) DEFAULT 'member',  -- owner, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vacation_id, user_id)
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    dress_code VARCHAR(100),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Excursions table
CREATE TABLE excursions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    cost DECIMAL(10, 2),
    booking_url TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Packing list table
CREATE TABLE packing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    is_packed BOOLEAN DEFAULT FALSE,
    added_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Itineraries table
CREATE TABLE itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Itinerary items table
CREATE TABLE itinerary_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,  -- event, excursion, custom
    item_id UUID,  -- References events or excursions
    custom_title VARCHAR(255),
    custom_description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
    uploaded_by VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    caption TEXT,
    taken_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recommendations table (cached recommendations)
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vacation_id UUID NOT NULL REFERENCES vacations(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,  -- restaurant, activity, attraction
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    rating DECIMAL(2, 1),
    price_level VARCHAR(10),
    external_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_vacations_created_by ON vacations(created_by);
CREATE INDEX idx_vacation_members_user_id ON vacation_members(user_id);
CREATE INDEX idx_vacation_members_vacation_id ON vacation_members(vacation_id);
CREATE INDEX idx_events_vacation_id ON events(vacation_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_excursions_vacation_id ON excursions(vacation_id);
CREATE INDEX idx_packing_items_vacation_id ON packing_items(vacation_id);
CREATE INDEX idx_itineraries_vacation_id ON itineraries(vacation_id);
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX idx_photos_vacation_id ON photos(vacation_id);
CREATE INDEX idx_chat_messages_vacation_id ON chat_messages(vacation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_recommendations_vacation_id ON recommendations(vacation_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_vacations_updated_at BEFORE UPDATE ON vacations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_excursions_updated_at BEFORE UPDATE ON excursions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packing_items_updated_at BEFORE UPDATE ON packing_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
