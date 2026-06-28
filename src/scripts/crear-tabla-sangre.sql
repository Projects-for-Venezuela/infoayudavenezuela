-- Script para crear la tabla de donación de sangre
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.centros_donacion_sangre (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    estado text NOT NULL,
    ciudad text NOT NULL,
    nombre_centro text NOT NULL,
    direccion text,
    contacto text,
    tipos_requeridos text[] DEFAULT '{}',
    tipos_no_urgentes text[] DEFAULT '{}',
    requisitos_adicionales text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.centros_donacion_sangre ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Lectura pública de centros de donacion" 
    ON public.centros_donacion_sangre 
    FOR SELECT 
    USING (true);

-- No se permiten inserts/updates/deletes públicos, solo el admin con service_role.
