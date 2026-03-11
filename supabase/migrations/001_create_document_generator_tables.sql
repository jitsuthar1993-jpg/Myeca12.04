-- Document Generator Platform Database Schema
-- Migration: 001_create_document_generator_tables.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'guest' CHECK (subscription_tier IN ('guest', 'registered', 'premium')),
    monthly_quota INTEGER DEFAULT 5,
    quota_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Templates table
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Export history table
CREATE TABLE public.export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    format TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'html', 'markdown')),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User preferences table
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    auto_save_enabled BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_documents_created_at ON public.documents(created_at);
CREATE INDEX idx_export_history_user_id ON public.export_history(user_id);
CREATE INDEX idx_export_history_document_id ON public.export_history(document_id);
CREATE INDEX idx_export_history_created_at ON public.export_history(created_at);
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_status ON public.templates(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Templates RLS Policies
CREATE POLICY "Anyone can view active templates" ON public.templates
    FOR SELECT USING (status = 'active');

CREATE POLICY "Premium users can view all templates" ON public.templates
    FOR SELECT USING (
        status = 'active' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND subscription_tier = 'premium'
        )
    );

-- Documents RLS Policies
CREATE POLICY "Users can view their own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Export History RLS Policies
CREATE POLICY "Users can view their own export history" ON public.export_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export history" ON public.export_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Preferences RLS Policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Function to handle user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.templates TO anon;
GRANT ALL ON public.templates TO authenticated;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.export_history TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;

-- Grant usage on sequences (only for tables that have serial/identity columns)
-- Note: UUID columns don't need sequence grants as they use uuid_generate_v4()

-- Insert default templates
INSERT INTO public.templates (name, category, description, thumbnail_url, is_premium, metadata) VALUES
('Professional Resume', 'resume', 'Clean and modern resume template', '/templates/resume-professional.jpg', false, '{"layout": "single-column", "color-schemes": ["blue", "green", "gray"]}'),
('Creative Resume', 'resume', 'Creative and colorful resume template', '/templates/resume-creative.jpg', true, '{"layout": "two-column", "color-schemes": ["purple", "orange", "teal"]}'),
('Basic Invoice', 'invoice', 'Simple and clean invoice template', '/templates/invoice-basic.jpg', false, '{"layout": "single-column", "color-schemes": ["blue", "gray"]}'),
('Premium Invoice', 'invoice', 'Professional invoice with detailed breakdown', '/templates/invoice-premium.jpg', true, '{"layout": "multi-column", "color-schemes": ["blue", "green", "red"]}'),
('Service Contract', 'contract', 'Standard service agreement template', '/templates/contract-service.jpg', false, '{"layout": "legal", "color-schemes": ["black"]}'),
('Employment Contract', 'contract', 'Employment agreement template', '/templates/contract-employment.jpg', true, '{"layout": "legal", "color-schemes": ["black"]}'),
('Business Report', 'report', 'Professional business report template', '/templates/report-business.jpg', false, '{"layout": "multi-section", "color-schemes": ["blue", "gray"]}'),
('Academic Report', 'report', 'Academic research report template', '/templates/report-academic.jpg', true, '{"layout": "multi-section", "color-schemes": ["blue", "green"]}'),
('Achievement Certificate', 'certificate', 'Certificate of achievement template', '/templates/certificate-achievement.jpg', false, '{"layout": "landscape", "color-schemes": ["gold", "blue", "green"]}'),
('Completion Certificate', 'certificate', 'Course completion certificate', '/templates/certificate-completion.jpg', true, '{"layout": "landscape", "color-schemes": ["gold", "purple", "teal"]}'),
('Formal Letter', 'letter', 'Professional business letter template', '/templates/letter-formal.jpg', false, '{"layout": "single-column", "color-schemes": ["black"]}'),
('Personal Letter', 'letter', 'Personal letter template', '/templates/letter-personal.jpg', false, '{"layout": "single-column", "color-schemes": ["black"]}');