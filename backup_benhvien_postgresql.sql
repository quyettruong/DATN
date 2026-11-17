--
-- PostgreSQL database dump
--

\restrict WNwwhjeWgVtB1tww3oL9KDbbH7mL2ecseAUWbndt2HgZoWO6vcUXWwqQuIj8BuD

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_date date,
    start_time time(6) without time zone,
    created_at timestamp(6) without time zone,
    doctor_id bigint,
    id bigint NOT NULL,
    patient_id bigint,
    schedule_id bigint,
    updated_at timestamp(6) without time zone,
    notes character varying(255),
    reason character varying(255),
    status character varying(255),
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'CANCELLED'::character varying, 'COMPLETED'::character varying, 'NO_SHOW'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: check_ins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.check_ins (
    blood_pressure_diastolic integer,
    blood_pressure_systolic integer,
    heart_rate integer,
    height double precision,
    spo2 integer,
    temperature double precision,
    weight double precision,
    appointment_id bigint,
    checked_in_at timestamp(6) without time zone,
    id bigint NOT NULL,
    triaged_at timestamp(6) without time zone,
    method character varying(255),
    status character varying(255),
    triage_level character varying(255),
    triaged_by_username character varying(255),
    CONSTRAINT check_ins_status_check CHECK (((status)::text = ANY ((ARRAY['CHECKED_IN'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT check_ins_triage_level_check CHECK (((triage_level)::text = ANY ((ARRAY['LEVEL_1_RESUSCITATION'::character varying, 'LEVEL_2_EMERGENCY'::character varying, 'LEVEL_3_URGENT'::character varying, 'LEVEL_4_SEMI_URGENT'::character varying, 'LEVEL_5_NON_URGENT'::character varying])::text[])))
);


ALTER TABLE public.check_ins OWNER TO postgres;

--
-- Name: check_ins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.check_ins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.check_ins_id_seq OWNER TO postgres;

--
-- Name: check_ins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.check_ins_id_seq OWNED BY public.check_ins.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    description character varying(255),
    name character varying(255)
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: doctor_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_schedules (
    booked_slots integer NOT NULL,
    date date,
    end_time time(6) without time zone,
    max_slots integer NOT NULL,
    start_time time(6) without time zone,
    doctor_id bigint,
    id bigint NOT NULL,
    room_id bigint
);


ALTER TABLE public.doctor_schedules OWNER TO postgres;

--
-- Name: doctor_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctor_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctor_schedules_id_seq OWNER TO postgres;

--
-- Name: doctor_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctor_schedules_id_seq OWNED BY public.doctor_schedules.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    created_at timestamp(6) without time zone,
    department_id bigint,
    id bigint NOT NULL,
    user_id bigint,
    license_no character varying(255),
    specialization character varying(255),
    status character varying(255)
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: drug_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drug_interactions (
    id bigint NOT NULL,
    active boolean NOT NULL,
    clinical_advice text,
    description text NOT NULL,
    severity character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    medication_a_id bigint NOT NULL,
    medication_b_id bigint NOT NULL
);


ALTER TABLE public.drug_interactions OWNER TO postgres;

--
-- Name: drug_interactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drug_interactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drug_interactions_id_seq OWNER TO postgres;

--
-- Name: drug_interactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drug_interactions_id_seq OWNED BY public.drug_interactions.id;


--
-- Name: drug_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drug_inventory (
    cost_price double precision NOT NULL,
    expiry_date date NOT NULL,
    reorder_level integer NOT NULL,
    selling_price double precision NOT NULL,
    stock_quantity integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    medication_id bigint NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    lot_number character varying(255) NOT NULL
);


ALTER TABLE public.drug_inventory OWNER TO postgres;

--
-- Name: drug_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drug_inventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drug_inventory_id_seq OWNER TO postgres;

--
-- Name: drug_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drug_inventory_id_seq OWNED BY public.drug_inventory.id;


--
-- Name: examinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.examinations (
    heart_rate integer,
    height double precision,
    temperature double precision,
    weight double precision,
    created_at timestamp(6) without time zone,
    doctor_id bigint,
    ended_at timestamp(6) without time zone,
    id bigint NOT NULL,
    patient_id bigint,
    queue_ticket_id bigint,
    started_at timestamp(6) without time zone,
    blood_pressure character varying(255),
    conclusion character varying(255),
    diagnosis character varying(255),
    notes character varying(255),
    symptoms character varying(255)
);


ALTER TABLE public.examinations OWNER TO postgres;

--
-- Name: examinations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.examinations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.examinations_id_seq OWNER TO postgres;

--
-- Name: examinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.examinations_id_seq OWNED BY public.examinations.id;


--
-- Name: follow_up_appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follow_up_appointments (
    scheduled_date date,
    created_at timestamp(6) without time zone,
    doctor_id bigint,
    examination_id bigint,
    id bigint NOT NULL,
    patient_id bigint,
    notes character varying(255),
    status character varying(255)
);


ALTER TABLE public.follow_up_appointments OWNER TO postgres;

--
-- Name: follow_up_appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.follow_up_appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.follow_up_appointments_id_seq OWNER TO postgres;

--
-- Name: follow_up_appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.follow_up_appointments_id_seq OWNED BY public.follow_up_appointments.id;


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    quantity integer NOT NULL,
    total_price double precision NOT NULL,
    unit_price double precision NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    reference_id bigint,
    item_name character varying(255) NOT NULL,
    item_type character varying(255) NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_items_id_seq OWNER TO postgres;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    consultation_fee double precision NOT NULL,
    discount_amount double precision NOT NULL,
    lab_fee double precision NOT NULL,
    medication_fee double precision NOT NULL,
    paid_amount double precision NOT NULL,
    total_amount double precision NOT NULL,
    appointment_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    examination_id bigint,
    id bigint NOT NULL,
    paid_at timestamp(6) without time zone,
    patient_id bigint NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    invoice_number character varying(255) NOT NULL,
    notes character varying(255),
    payment_method character varying(255),
    status character varying(255) NOT NULL,
    CONSTRAINT invoices_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['CASH'::character varying, 'CARD'::character varying, 'TRANSFER'::character varying, 'BHYT'::character varying])::text[]))),
    CONSTRAINT invoices_status_check CHECK (((status)::text = ANY ((ARRAY['UNPAID'::character varying, 'PARTIAL'::character varying, 'PAID'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: lab_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_orders (
    created_at timestamp(6) without time zone,
    examination_id bigint,
    id bigint NOT NULL,
    lab_test_id bigint,
    ordered_at timestamp(6) without time zone,
    notes character varying(255),
    status character varying(255),
    CONSTRAINT lab_orders_status_check CHECK (((status)::text = ANY ((ARRAY['ORDERED'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.lab_orders OWNER TO postgres;

--
-- Name: lab_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_orders_id_seq OWNER TO postgres;

--
-- Name: lab_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_orders_id_seq OWNED BY public.lab_orders.id;


--
-- Name: lab_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_results (
    is_abnormal boolean NOT NULL,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    lab_order_id bigint,
    performed_by_id bigint,
    verified_at timestamp(6) without time zone,
    notes character varying(255),
    result_text character varying(255),
    result_value character varying(255),
    attachment_url character varying(255)
);


ALTER TABLE public.lab_results OWNER TO postgres;

--
-- Name: lab_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_results_id_seq OWNER TO postgres;

--
-- Name: lab_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_results_id_seq OWNED BY public.lab_results.id;


--
-- Name: lab_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_tests (
    active boolean NOT NULL,
    price double precision,
    id bigint NOT NULL,
    category character varying(255),
    code character varying(255),
    description character varying(255),
    name character varying(255),
    normal_range character varying(255),
    unit character varying(255)
);


ALTER TABLE public.lab_tests OWNER TO postgres;

--
-- Name: lab_tests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_tests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_tests_id_seq OWNER TO postgres;

--
-- Name: lab_tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_tests_id_seq OWNED BY public.lab_tests.id;


--
-- Name: medications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medications (
    active boolean NOT NULL,
    id bigint NOT NULL,
    code character varying(255),
    dosage_form character varying(255),
    generic_name character varying(255),
    manufacturer character varying(255),
    name character varying(255),
    strength character varying(255),
    unit character varying(255)
);


ALTER TABLE public.medications OWNER TO postgres;

--
-- Name: medications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medications_id_seq OWNER TO postgres;

--
-- Name: medications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medications_id_seq OWNED BY public.medications.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    dob date,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    user_id bigint,
    address character varying(255),
    gender character varying(255),
    patient_code character varying(255) NOT NULL,
    allergies text,
    blood_type character varying(255),
    medical_history text
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_items (
    quantity integer NOT NULL,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    medication_id bigint,
    prescription_id bigint,
    dosage character varying(255),
    duration character varying(255),
    frequency character varying(255),
    instruction character varying(255)
);


ALTER TABLE public.prescription_items OWNER TO postgres;

--
-- Name: prescription_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_items_id_seq OWNER TO postgres;

--
-- Name: prescription_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_items_id_seq OWNED BY public.prescription_items.id;


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    created_at timestamp(6) without time zone,
    doctor_id bigint,
    examination_id bigint,
    id bigint NOT NULL,
    patient_id bigint,
    prescribed_at timestamp(6) without time zone,
    diagnosis character varying(255),
    notes character varying(255),
    status character varying(255)
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_id_seq OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- Name: queue_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_tickets (
    estimated_wait_minutes integer,
    is_return_patient boolean,
    is_walk_in boolean,
    priority_score integer NOT NULL,
    queue_date date,
    urgency_level integer NOT NULL,
    called_at timestamp(6) without time zone,
    check_in_id bigint,
    completed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    doctor_id bigint,
    id bigint NOT NULL,
    last_priority_calc_at timestamp(6) without time zone,
    room_id bigint,
    started_at timestamp(6) without time zone,
    queue_number character varying(255),
    status character varying(255),
    triage_level character varying(255),
    CONSTRAINT queue_tickets_status_check CHECK (((status)::text = ANY ((ARRAY['WAITING'::character varying, 'CALLED'::character varying, 'IN_EXAM'::character varying, 'WAITING_LAB'::character varying, 'LAB_IN_PROGRESS'::character varying, 'LAB_RESULT_READY'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying, 'SKIPPED'::character varying, 'NO_SHOW'::character varying])::text[]))),
    CONSTRAINT queue_tickets_triage_level_check CHECK (((triage_level)::text = ANY ((ARRAY['LEVEL_1_RESUSCITATION'::character varying, 'LEVEL_2_EMERGENCY'::character varying, 'LEVEL_3_URGENT'::character varying, 'LEVEL_4_SEMI_URGENT'::character varying, 'LEVEL_5_NON_URGENT'::character varying])::text[])))
);


ALTER TABLE public.queue_tickets OWNER TO postgres;

--
-- Name: queue_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_tickets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_tickets_id_seq OWNER TO postgres;

--
-- Name: queue_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queue_tickets_id_seq OWNED BY public.queue_tickets.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    capacity integer NOT NULL,
    department_id bigint,
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255),
    status character varying(255),
    type character varying(255)
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rooms_id_seq OWNER TO postgres;

--
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    setting_key character varying(100) NOT NULL,
    setting_value text,
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    enabled boolean NOT NULL,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    email character varying(255),
    full_name character varying(255),
    password character varying(255) NOT NULL,
    phone character varying(255),
    role character varying(255),
    username character varying(255) NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'DOCTOR'::character varying, 'STAFF'::character varying, 'LAB_TECHNICIAN'::character varying, 'PATIENT'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: check_ins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins ALTER COLUMN id SET DEFAULT nextval('public.check_ins_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: doctor_schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_schedules ALTER COLUMN id SET DEFAULT nextval('public.doctor_schedules_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: drug_interactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_interactions ALTER COLUMN id SET DEFAULT nextval('public.drug_interactions_id_seq'::regclass);


--
-- Name: drug_inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_inventory ALTER COLUMN id SET DEFAULT nextval('public.drug_inventory_id_seq'::regclass);


--
-- Name: examinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examinations ALTER COLUMN id SET DEFAULT nextval('public.examinations_id_seq'::regclass);


--
-- Name: follow_up_appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_appointments ALTER COLUMN id SET DEFAULT nextval('public.follow_up_appointments_id_seq'::regclass);


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: lab_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders ALTER COLUMN id SET DEFAULT nextval('public.lab_orders_id_seq'::regclass);


--
-- Name: lab_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results ALTER COLUMN id SET DEFAULT nextval('public.lab_results_id_seq'::regclass);


--
-- Name: lab_tests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_tests ALTER COLUMN id SET DEFAULT nextval('public.lab_tests_id_seq'::regclass);


--
-- Name: medications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medications ALTER COLUMN id SET DEFAULT nextval('public.medications_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: prescription_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items ALTER COLUMN id SET DEFAULT nextval('public.prescription_items_id_seq'::regclass);


--
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.prescriptions_id_seq'::regclass);


--
-- Name: queue_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tickets ALTER COLUMN id SET DEFAULT nextval('public.queue_tickets_id_seq'::regclass);


--
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_date, start_time, created_at, doctor_id, id, patient_id, schedule_id, updated_at, notes, reason, status) FROM stdin;
2026-10-25	08:30:00	2026-10-25 22:23:16.306056	1	1	1	1	2026-10-25 22:23:16.306056	\N	Khám tổng quát	CONFIRMED
2026-10-26	09:00:00	2026-10-25 22:23:16.310073	2	2	1	6	2026-10-25 22:23:16.310073	\N	Đau dạ dày	PENDING
2026-10-24	14:00:00	2026-10-25 22:23:16.311052	3	3	1	12	2026-10-25 22:23:16.311052	\N	Đau họng	COMPLETED
2026-10-25	09:30:00	2026-10-25 22:23:16.31205	2	4	2	5	2026-10-25 22:23:16.31205	\N	Khám ngoại	CONFIRMED
2026-10-26	10:00:00	2026-10-25 22:23:16.313052	4	5	2	14	2026-10-25 22:23:16.313052	\N	Nhổ răng	PENDING
2026-10-25	13:30:00	2026-10-25 22:23:16.314052	3	6	3	9	2026-10-25 22:23:16.314052	\N	Viêm xoang	CONFIRMED
2026-10-26	08:45:00	2026-10-25 22:23:16.316052	1	7	3	2	2026-10-25 22:23:16.316052	\N	Đau đầu	PENDING
2026-10-24	10:30:00	2026-10-25 22:23:16.317065	2	8	3	8	2026-10-25 22:23:16.317065	\N	Cắt chỉ	COMPLETED
2026-10-25	08:15:00	2026-10-25 22:23:16.318052	4	9	4	13	2026-10-25 22:23:16.318052	\N	Trám răng	CONFIRMED
2026-10-26	14:30:00	2026-10-25 22:23:16.319051	3	10	4	10	2026-10-25 22:23:16.319051	\N	Ù tai	PENDING
2026-10-25	10:00:00	2026-10-25 22:23:16.319051	1	11	5	1	2026-10-25 22:23:16.319051	\N	Mệt mỏi	CONFIRMED
2026-10-24	11:00:00	2026-10-25 22:23:16.32005	4	12	5	16	2026-10-25 22:23:16.32005	\N	Khám định kỳ	COMPLETED
2026-11-17	08:00:00	2026-11-17 00:46:39.868577	1	13	1	\N	\N	\N	Khám sức khỏe định kỳ & Tim mạch	CONFIRMED
2026-11-17	08:30:00	2026-11-17 00:46:39.868577	1	14	2	\N	\N	\N	Đau tức ngực trái khi gắng sức	CONFIRMED
2026-11-17	09:00:00	2026-11-17 00:46:39.868577	1	15	3	\N	\N	\N	Tăng huyết áp dao động	CONFIRMED
2026-11-17	09:30:00	2026-11-17 00:46:39.868577	1	16	4	\N	\N	\N	Tái khám đái tháo đường Tuýp 2	CONFIRMED
\.


--
-- Data for Name: check_ins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.check_ins (blood_pressure_diastolic, blood_pressure_systolic, heart_rate, height, spo2, temperature, weight, appointment_id, checked_in_at, id, triaged_at, method, status, triage_level, triaged_by_username) FROM stdin;
80	120	76	160	98	37.8	52	3	2026-11-15 13:50:43.303832	1	\N	COUNTER	CHECKED_IN	LEVEL_5_NON_URGENT	\N
80	120	75	\N	98	36.8	\N	16	2026-11-17 00:46:39.873131	2	2026-11-17 00:46:39.873131	KIOSK	CHECKED_IN	LEVEL_3_URGENT	\N
80	120	75	\N	98	36.8	\N	15	2026-11-17 00:46:39.873131	3	2026-11-17 00:46:39.873131	KIOSK	CHECKED_IN	LEVEL_3_URGENT	\N
80	120	75	\N	98	36.8	\N	14	2026-11-17 00:46:39.873131	4	2026-11-17 00:46:39.873131	KIOSK	CHECKED_IN	LEVEL_3_URGENT	\N
80	120	75	\N	98	36.8	\N	13	2026-11-17 00:46:39.873131	5	2026-11-17 00:46:39.873131	KIOSK	CHECKED_IN	LEVEL_3_URGENT	\N
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (created_at, id, code, description, name) FROM stdin;
2026-10-25 22:23:16.237758	1	NOI	Khoa khám và điều trị các bệnh nội khoa	Nội tổng quát
2026-10-25 22:23:16.240771	2	NGOAI	Khoa khám và điều trị các bệnh ngoại khoa	Ngoại tổng quát
2026-10-25 22:23:16.241767	3	TMH	Khoa khám và điều trị tai mũi họng	Tai Mũi Họng
2026-10-25 22:23:16.241767	4	RHM	Khoa khám và điều trị răng hàm mặt	Răng Hàm Mặt
2026-10-25 22:23:16.242767	5	MAT	Khoa khám và điều trị mắt	Mắt
2026-10-25 22:23:16.243767	6	DA	Khoa khám và điều trị da liễu	Da liễu
\.


--
-- Data for Name: doctor_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor_schedules (booked_slots, date, end_time, max_slots, start_time, doctor_id, id, room_id) FROM stdin;
0	2026-10-27	12:00:00	20	08:00:00	1	3	1
0	2026-10-24	12:00:00	20	08:00:00	1	4	1
0	2026-10-27	12:00:00	15	08:00:00	2	7	3
0	2026-10-27	17:00:00	18	13:00:00	3	11	5
0	2026-10-27	12:00:00	15	08:00:00	4	15	7
2	2026-10-25	12:00:00	20	08:00:00	1	1	1
1	2026-10-26	12:00:00	20	08:00:00	1	2	1
1	2026-10-25	12:00:00	15	08:00:00	2	5	3
1	2026-10-26	12:00:00	15	08:00:00	2	6	3
1	2026-10-24	12:00:00	15	08:00:00	2	8	3
1	2026-10-25	17:00:00	18	13:00:00	3	9	5
1	2026-10-26	17:00:00	18	13:00:00	3	10	5
1	2026-10-24	17:00:00	18	13:00:00	3	12	5
1	2026-10-25	12:00:00	15	08:00:00	4	13	7
1	2026-10-26	12:00:00	15	08:00:00	4	14	7
1	2026-10-24	12:00:00	15	08:00:00	4	16	7
0	2026-11-07	12:00:00	18	08:00:00	5	17	9
0	2026-11-08	12:00:00	18	08:00:00	5	18	9
0	2026-11-09	12:00:00	18	08:00:00	5	19	9
0	2026-11-07	17:00:00	18	13:00:00	6	20	11
0	2026-11-08	17:00:00	18	13:00:00	6	21	11
0	2026-11-09	17:00:00	18	13:00:00	6	22	11
0	2026-11-16	17:30:00	30	07:00:00	1	23	1
0	2026-11-17	17:30:00	30	07:00:00	1	24	1
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (created_at, department_id, id, user_id, license_no, specialization, status) FROM stdin;
2026-10-25 22:23:16.260353	1	1	2	LIC001	Nội tổng quát & Tim mạch	ACTIVE
2026-10-25 22:23:16.26335	2	2	3	LIC002	Ngoại tổng quát & Phẫu thuật	ACTIVE
2026-10-25 22:23:16.264348	3	3	4	LIC003	Tai Mũi Họng	ACTIVE
2026-10-25 22:23:16.26635	4	4	5	LIC004	Răng Hàm Mặt	ACTIVE
2026-11-07 16:56:26.3463	5	5	18	LIC005	Nhãn khoa & Khúc xạ	ACTIVE
2026-11-07 16:56:26.363386	6	6	19	LIC006	Da liễu & Thẩm mỹ nội khoa	ACTIVE
\.


--
-- Data for Name: drug_interactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drug_interactions (id, active, clinical_advice, description, severity, title, medication_a_id, medication_b_id) FROM stdin;
1	t	Hạn chế phối hợp. Nếu bắt buộc điều trị, chỉ định kèm thuốc ức chế bơm proton (Omeprazole) để bảo vệ niêm mạc dạ dày.	Sử dụng đồng thời Ibuprofen và Dexamethasone làm tăng đột biến nguy cơ loét đường tiêu hóa, xuất huyết tiêu hóa nghiêm trọng và thủng dạ dày.	CRITICAL	Nguy cơ Loét & Xuất huyết Tiêu hóa Nặng (NSAID + Corticosteroid)	7	9
2	t	Theo dõi huyết áp định kỳ của người bệnh và cân nhắc dùng Paracetamol để giảm đau thay thế.	NSAID (Ibuprofen) ức chế tổng hợp prostaglandin tại thận, gây ứ trệ natri và nước, làm suy giảm hiệu quả điều trị tăng huyết áp của Amlodipine.	WARNING	Giảm tác dụng hạ huyết áp của Amlodipine	7	5
3	t	Tránh phối hợp trừ khi tuyệt đối cần thiết. Theo dõi sát triệu chứng đau nhức vùng gót chân của bệnh nhân.	Phối hợp Quinolone (Ciprofloxacin) cùng Corticosteroid (Dexamethasone) làm tăng gấp nhiều lần nguy cơ viêm gân và đứt gân gót Achilles, đặc biệt ở người lớn tuổi.	CRITICAL	Nguy cơ Viêm đứt gân gót Achilles (Quinolone + Corticosteroid)	8	9
4	t	Hướng dẫn người bệnh tự theo dõi sát chỉ số đường huyết mao mạch trong đợt điều trị kháng sinh.	Ciprofloxacin có thể làm xáo trộn đường huyết nghiêm trọng (hạ đường huyết quá mức hoặc tăng đường huyết) khi dùng chung với Metformin.	WARNING	Rối loạn dao động nồng độ đường huyết ở bệnh nhân Đái tháo đường	4	8
\.


--
-- Data for Name: drug_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drug_inventory (cost_price, expiry_date, reorder_level, selling_price, stock_quantity, created_at, id, medication_id, updated_at, lot_number) FROM stdin;
1400	2028-11-07	50	2000	200	2026-10-25 22:23:16.367053	1	1	2026-11-07 16:56:26.303757	LOT1-M01
1400	2028-11-07	50	2000	150	2026-10-25 22:23:16.369051	2	1	2026-11-07 16:56:26.303757	LOT2-M01
3500	2028-11-07	50	5000	200	2026-10-25 22:23:16.370052	3	2	2026-11-07 16:56:26.303757	LOT1-M02
3500	2028-11-07	50	5000	150	2026-10-25 22:23:16.371053	4	2	2026-11-07 16:56:26.303757	LOT2-M02
5600	2028-11-07	50	8000	200	2026-10-25 22:23:16.372056	5	3	2026-11-07 16:56:26.303757	LOT1-M03
5600	2028-11-07	50	8000	150	2026-10-25 22:23:16.374052	6	3	2026-11-07 16:56:26.303757	LOT2-M03
2100	2028-11-07	50	3000	200	2026-10-25 22:23:16.37505	7	4	2026-11-07 16:56:26.303757	LOT1-M04
2100	2028-11-07	50	3000	150	2026-10-25 22:23:16.376051	8	4	2026-11-07 16:56:26.303757	LOT2-M04
4200	2028-11-07	50	6000	200	2026-10-25 22:23:16.377053	9	5	2026-11-07 16:56:26.303757	LOT1-M05
4200	2028-11-07	50	6000	150	2026-10-25 22:23:16.378052	10	5	2026-11-07 16:56:26.303757	LOT2-M05
3500	2028-11-07	50	5000	200	2026-10-25 22:23:16.380049	11	6	2026-11-07 16:56:26.303757	LOT1-M06
3500	2028-11-07	50	5000	150	2026-10-25 22:23:16.38105	12	6	2026-11-07 16:56:26.303757	LOT2-M06
3500	2028-11-07	50	5000	200	2026-10-25 22:23:16.38105	13	7	2026-11-07 16:56:26.303757	LOT1-M07
3500	2028-11-07	50	5000	150	2026-10-25 22:23:16.382049	14	7	2026-11-07 16:56:26.303757	LOT2-M07
3500	2028-11-07	50	5000	200	2026-10-25 22:23:16.383051	15	8	2026-11-07 16:56:26.303757	LOT1-M08
3500	2028-11-07	50	5000	150	2026-10-25 22:23:16.383051	16	8	2026-11-07 16:56:26.303757	LOT2-M08
3500	2028-11-07	50	5000	200	2026-10-25 22:23:16.384049	17	9	2026-11-07 16:56:26.30476	LOT1-M09
3500	2028-11-07	50	5000	150	2026-10-25 22:23:16.385053	18	9	2026-11-07 16:56:26.30476	LOT2-M09
3500	2028-11-07	50	5000	200	2026-10-25 22:23:16.386065	19	10	2026-11-07 16:56:26.30476	LOT1-M10
3500	2028-11-07	50	5000	150	2026-10-25 22:23:16.387051	20	10	2026-11-07 16:56:26.30476	LOT2-M10
\.


--
-- Data for Name: examinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.examinations (heart_rate, height, temperature, weight, created_at, doctor_id, ended_at, id, patient_id, queue_ticket_id, started_at, blood_pressure, conclusion, diagnosis, notes, symptoms) FROM stdin;
76	160	37.8	52	2026-11-16 21:21:43.349409	3	2026-11-15 14:25:43.348398	1	1	1	2026-11-15 14:05:43.348398	120/80	Uống thuốc theo đơn đủ 5 ngày, súc họng nước muối sinh lý ấm, uống nhiều nước ấm. Tái khám sau 5 ngày nếu không thuyên giảm.	Viêm họng cấp tính do thời tiết (J02.9)	Bệnh nhân có cơ địa dị ứng Penicillin - TUYỆT ĐỐI KHÔNG dùng Beta-lactam. Tiền sử đau dạ dày - kê kèm Omeprazole bảo vệ niêm mạc.	Đau rát họng khi nuốt, ho khan từng cơn, sốt nhẹ 37.8°C
\.


--
-- Data for Name: follow_up_appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follow_up_appointments (scheduled_date, created_at, doctor_id, examination_id, id, patient_id, notes, status) FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (quantity, total_price, unit_price, created_at, id, invoice_id, reference_id, item_name, item_type) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (consultation_fee, discount_amount, lab_fee, medication_fee, paid_amount, total_amount, appointment_id, created_at, examination_id, id, paid_at, patient_id, updated_at, invoice_number, notes, payment_method, status) FROM stdin;
150000	0	0	0	0	150000	1	2026-10-25 22:23:16.398052	\N	1	\N	1	2026-10-25 22:23:16.398052	INV-20240916-00001	\N	\N	UNPAID
150000	0	0	0	150000	150000	3	2026-10-25 22:23:16.402051	\N	2	\N	1	2026-10-25 22:23:16.402051	INV-20240916-00002	\N	\N	PAID
150000	0	0	0	0	150000	4	2026-10-25 22:23:16.404052	\N	3	\N	2	2026-10-25 22:23:16.404052	INV-20240916-00003	\N	\N	UNPAID
150000	0	0	0	0	150000	6	2026-10-25 22:23:16.408056	\N	4	\N	3	2026-10-25 22:23:16.408056	INV-20240916-00004	\N	\N	UNPAID
150000	0	0	0	150000	150000	8	2026-10-25 22:23:16.410052	\N	5	\N	3	2026-10-25 22:23:16.410052	INV-20240916-00005	\N	\N	PAID
150000	0	0	0	0	150000	9	2026-10-25 22:23:16.41305	\N	6	\N	4	2026-10-25 22:23:16.41305	INV-20240916-00006	\N	\N	UNPAID
150000	0	0	0	0	150000	11	2026-10-25 22:23:16.416052	\N	7	\N	5	2026-10-25 22:23:16.416052	INV-20240916-00007	\N	\N	UNPAID
150000	0	0	0	150000	150000	12	2026-10-25 22:23:16.417912	\N	8	\N	5	2026-10-25 22:23:16.417912	INV-20240916-00008	\N	\N	PAID
\.


--
-- Data for Name: lab_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_orders (created_at, examination_id, id, lab_test_id, ordered_at, notes, status) FROM stdin;
\.


--
-- Data for Name: lab_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_results (is_abnormal, created_at, id, lab_order_id, performed_by_id, verified_at, notes, result_text, result_value, attachment_url) FROM stdin;
\.


--
-- Data for Name: lab_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_tests (active, price, id, category, code, description, name, normal_range, unit) FROM stdin;
t	120000	1	BLOOD	CBC	\N	Công thức máu (CBC)	WBC 4.0-10.0, RBC 4.2-5.4	G/L
t	80000	2	BLOOD	GLU	\N	Đường huyết (Glucose)	3.9 - 6.4 mmol/L	mmol/L
t	95000	3	BLOOD	CHOL	\N	Cholesterol	< 5.2 mmol/L	mmol/L
t	85000	4	BLOOD	CREA	\N	Creatinine	62 - 106 µmol/L	µmol/L
t	110000	5	BLOOD	GOT	\N	GOT/GPT	< 40 U/L	U/L
t	90000	6	URINE	URINE	\N	Tổng phân tích nước tiểu	Âm tính, pH 5.0-7.5	pH / SG
t	180000	7	IMAGING	XRAY	\N	X-quang ngực	Tim phổi bình thường	Hình ảnh
t	220000	8	IMAGING	US	\N	Siêu âm bụng	Gan mật tụy lách thận bình thường	Hình ảnh
t	150000	9	BLOOD	HBA1C	\N	HbA1c	4.0 - 5.6 %	%
t	180000	10	BLOOD	TSH	\N	TSH	0.4 - 4.0 mIU/L	mIU/L
\.


--
-- Data for Name: medications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medications (active, id, code, dosage_form, generic_name, manufacturer, name, strength, unit) FROM stdin;
t	1	M01	TABLET	Paracetamol	\N	Paracetamol 500mg	\N	\N
t	2	M02	CAPSULE	Amoxicillin	\N	Amoxicillin 500mg	\N	\N
t	3	M03	CAPSULE	Omeprazole	\N	Omeprazole 20mg	\N	\N
t	4	M04	TABLET	Metformin	\N	Metformin 500mg	\N	\N
t	5	M05	TABLET	Amlodipine	\N	Amlodipine 5mg	\N	\N
t	6	M06	TABLET	Cetirizine	\N	Cetirizine 10mg	\N	\N
t	7	M07	TABLET	Ibuprofen	\N	Ibuprofen 400mg	\N	\N
t	8	M08	TABLET	Ciprofloxacin	\N	Ciprofloxacin 500mg	\N	\N
t	9	M09	TABLET	Dexamethasone	\N	Dexamethasone	\N	\N
t	10	M10	INHALER	Salbutamol	\N	Salbutamol	\N	\N
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (dob, created_at, id, user_id, address, gender, patient_code, allergies, blood_type, medical_history) FROM stdin;
1990-05-15	2026-10-25 22:23:16.269347	1	10	Hà Nội	FEMALE	BN000001	Penicillin, Dị ứng hải sản	O+	Tiền sử viêm loét dạ dày tá tràng mạn tính
1985-08-22	2026-10-25 22:23:16.271348	2	11	TP.HCM	MALE	BN000002	Aspirin, Nhóm NSAID	A+	Tăng huyết áp vô căn, Hen phế quản
1975-03-10	2026-10-25 22:23:16.273353	3	12	Đà Nẵng	FEMALE	BN000003	Paracetamol	B+	Đái tháo đường Type 2
2000-12-01	2026-10-25 22:23:16.27536	4	13	Hà Nội	MALE	BN000004	Không ghi nhận dị ứng	O+	Chưa ghi nhận bệnh lý đặc biệt
1995-07-18	2026-10-25 22:23:16.277357	5	14	Hải Phòng	FEMALE	BN000005	Không ghi nhận dị ứng	O+	Chưa ghi nhận bệnh lý đặc biệt
1988-11-25	2026-10-25 22:23:16.278359	6	15	Cần Thơ	MALE	BN000006	Không ghi nhận dị ứng	O+	Chưa ghi nhận bệnh lý đặc biệt
1970-01-30	2026-10-25 22:23:16.279356	7	16	Huế	FEMALE	BN000007	Không ghi nhận dị ứng	O+	Chưa ghi nhận bệnh lý đặc biệt
1998-09-05	2026-10-25 22:23:16.282372	8	17	Nghệ An	MALE	BN000008	Không ghi nhận dị ứng	O+	Chưa ghi nhận bệnh lý đặc biệt
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_items (quantity, created_at, id, medication_id, prescription_id, dosage, duration, frequency, instruction) FROM stdin;
15	2026-11-16 21:21:43.378139	1	1	1	500mg	5 ngày	3 lần/ngày	Uống 1 viên sau ăn khi sốt > 38.5°C hoặc họng đau nhiều
5	2026-11-16 21:21:43.383651	2	6	1	10mg	5 ngày	1 lần/ngày	Uống 1 viên vào buổi tối trước khi đi ngủ
7	2026-11-16 21:21:43.384662	3	3	1	20mg	7 ngày	1 lần/ngày	Uống 1 viên trước bữa ăn sáng 30 phút để bảo vệ dạ dày
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (created_at, doctor_id, examination_id, id, patient_id, prescribed_at, diagnosis, notes, status) FROM stdin;
2026-11-16 21:21:43.35344	3	1	1	1	2026-11-15 14:25:43.352918	Viêm họng cấp tính (J02.9)	Uống sau khi ăn no. Tuyệt đối kiêng đồ uống đá lạnh và chất kích thích.	COMPLETED
\.


--
-- Data for Name: queue_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.queue_tickets (estimated_wait_minutes, is_return_patient, is_walk_in, priority_score, queue_date, urgency_level, called_at, check_in_id, completed_at, created_at, doctor_id, id, last_priority_calc_at, room_id, started_at, queue_number, status, triage_level) FROM stdin;
\N	f	f	0	2026-11-15	0	2026-11-15 14:00:43.343878	1	2026-11-15 14:30:43.343878	2026-11-16 21:21:43.343878	3	1	\N	5	2026-11-15 14:05:43.343878	C001	COMPLETED	\N
0	f	f	85	2026-11-17	3	2026-11-17 00:44:39.875833	5	\N	2026-11-17 00:21:39.875833	1	6	\N	1	\N	A-108	CALLED	\N
15	f	f	72	2026-11-17	3	\N	4	\N	2026-11-17 00:28:39.875833	1	7	\N	1	\N	A-109	WAITING	\N
30	f	f	65	2026-11-17	3	\N	3	\N	2026-11-17 00:34:39.875833	1	8	\N	1	\N	A-110	WAITING	\N
45	f	f	58	2026-11-17	4	\N	2	\N	2026-11-17 00:41:39.875833	1	9	\N	1	\N	A-111	WAITING	\N
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (capacity, department_id, id, code, name, status, type) FROM stdin;
1	1	1	R101	Phòng R101	ACTIVE	EXAM
1	1	2	R102	Phòng R102	ACTIVE	EXAM
1	2	3	R201	Phòng R201	ACTIVE	EXAM
1	2	4	R202	Phòng R202	ACTIVE	EXAM
1	3	5	R301	Phòng R301	ACTIVE	EXAM
1	3	6	R302	Phòng R302	ACTIVE	EXAM
1	4	7	R401	Phòng R401	ACTIVE	EXAM
1	4	8	R402	Phòng R402	ACTIVE	EXAM
1	5	9	R501	Phòng R501	ACTIVE	EXAM
1	5	10	R502	Phòng R502	ACTIVE	EXAM
1	6	11	R601	Phòng R601	ACTIVE	EXAM
1	6	12	R602	Phòng R602	ACTIVE	EXAM
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (setting_key, setting_value, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (enabled, created_at, id, updated_at, email, full_name, password, phone, role, username) FROM stdin;
t	2026-10-25 22:23:16.188245	1	2026-10-25 22:23:16.188245	admin@hospital.local	Admin User	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0900000000	ADMIN	admin
t	2026-10-25 22:23:16.217245	2	2026-10-25 22:23:16.217245	doctor1@hospital.local	BS. Nguyễn Văn An	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0910000001	DOCTOR	doctor1
t	2026-10-25 22:23:16.220268	3	2026-10-25 22:23:16.220268	doctor2@hospital.local	BS. Trần Thị Bình	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0910000002	DOCTOR	doctor2
t	2026-10-25 22:23:16.221245	4	2026-10-25 22:23:16.221245	doctor3@hospital.local	BS. Lê Hoàng Cường	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0910000003	DOCTOR	doctor3
t	2026-10-25 22:23:16.222242	5	2026-10-25 22:23:16.222242	doctor4@hospital.local	BS. Phạm Minh Đức	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0910000004	DOCTOR	doctor4
t	2026-10-25 22:23:16.22325	6	2026-10-25 22:23:16.22325	staff1@hospital.local	Ngô Thị Hà	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0920000001	STAFF	staff1
t	2026-10-25 22:23:16.225249	7	2026-10-25 22:23:16.225249	staff2@hospital.local	Đỗ Văn Phong	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0920000002	STAFF	staff2
t	2026-10-25 22:23:16.226249	8	2026-10-25 22:23:16.226249	lab1@hospital.local	Vũ Thị Lan	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0930000001	LAB_TECHNICIAN	lab1
t	2026-10-25 22:23:16.228248	9	2026-10-25 22:23:16.228248	lab2@hospital.local	Hoàng Văn Sơn	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0930000002	LAB_TECHNICIAN	lab2
t	2026-10-25 22:23:16.228248	10	2026-10-25 22:23:16.228248	patient1@hospital.local	Lê Thị Mai	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0940000001	PATIENT	patient1
t	2026-10-25 22:23:16.229249	11	2026-10-25 22:23:16.229249	patient2@hospital.local	Trần Văn Hùng	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0940000002	PATIENT	patient2
t	2026-10-25 22:23:16.230248	12	2026-10-25 22:23:16.230248	patient3@hospital.local	Nguyễn Thị Hoa	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0940000003	PATIENT	patient3
t	2026-10-25 22:23:16.230248	13	2026-10-25 22:23:16.230248	patient4@hospital.local	Phạm Đức Anh	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0940000004	PATIENT	patient4
t	2026-10-25 22:23:16.231249	14	2026-10-25 22:23:16.231249	patient5@hospital.local	Võ Thị Ngọc	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0940000005	PATIENT	patient5
t	2026-10-25 22:23:16.233249	15	2026-10-25 22:23:16.233249	patient6@hospital.local	Đặng Minh Tuấn	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0940000006	PATIENT	patient6
t	2026-10-25 22:23:16.23525	16	2026-10-25 22:23:16.23525	patient7@hospital.local	Bùi Thị Thanh	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0940000007	PATIENT	patient7
t	2026-10-25 22:23:16.236251	17	2026-10-25 22:23:16.236251	patient8@hospital.local	Lý Văn Khoa	$2a$10$mgdma8aW5aqhEnqaCs3oDeQbFqM0J/WOV8Fpym9uiMhV.FlNbeWH6	0940000008	PATIENT	patient8
t	2026-11-07 16:56:26.34462	18	2026-11-07 16:56:26.34462	doctor5@hospital.local	BS. Võ Minh Khôi	$2a$10$FNXDzNryJ6BsMUc62H88B.HtzFL/4kbTW4jrNDIv.eRFZmG03XtIq	0910000005	DOCTOR	doctor5
t	2026-11-07 16:56:26.361383	19	2026-11-07 16:56:26.361383	doctor6@hospital.local	BS. Đặng Thu Thảo	$2a$10$FNXDzNryJ6BsMUc62H88B.HtzFL/4kbTW4jrNDIv.eRFZmG03XtIq	0910000006	DOCTOR	doctor6
\.


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 16, true);


--
-- Name: check_ins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.check_ins_id_seq', 5, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 6, true);


--
-- Name: doctor_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctor_schedules_id_seq', 24, true);


--
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctors_id_seq', 6, true);


--
-- Name: drug_interactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drug_interactions_id_seq', 4, true);


--
-- Name: drug_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drug_inventory_id_seq', 20, true);


--
-- Name: examinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.examinations_id_seq', 1, true);


--
-- Name: follow_up_appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.follow_up_appointments_id_seq', 1, false);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_id_seq', 8, true);


--
-- Name: lab_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_orders_id_seq', 1, false);


--
-- Name: lab_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_results_id_seq', 1, false);


--
-- Name: lab_tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_tests_id_seq', 10, true);


--
-- Name: medications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medications_id_seq', 10, true);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 8, true);


--
-- Name: prescription_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescription_items_id_seq', 3, true);


--
-- Name: prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescriptions_id_seq', 1, true);


--
-- Name: queue_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.queue_tickets_id_seq', 9, true);


--
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rooms_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: check_ins check_ins_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_appointment_id_key UNIQUE (appointment_id);


--
-- Name: check_ins check_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: doctor_schedules doctor_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_schedules
    ADD CONSTRAINT doctor_schedules_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_key UNIQUE (user_id);


--
-- Name: drug_interactions drug_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_interactions
    ADD CONSTRAINT drug_interactions_pkey PRIMARY KEY (id);


--
-- Name: drug_inventory drug_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_inventory
    ADD CONSTRAINT drug_inventory_pkey PRIMARY KEY (id);


--
-- Name: examinations examinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT examinations_pkey PRIMARY KEY (id);


--
-- Name: examinations examinations_queue_ticket_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT examinations_queue_ticket_id_key UNIQUE (queue_ticket_id);


--
-- Name: follow_up_appointments follow_up_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_appointments
    ADD CONSTRAINT follow_up_appointments_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_appointment_id_key UNIQUE (appointment_id);


--
-- Name: invoices invoices_examination_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_examination_id_key UNIQUE (examination_id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lab_orders lab_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_pkey PRIMARY KEY (id);


--
-- Name: lab_results lab_results_lab_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_lab_order_id_key UNIQUE (lab_order_id);


--
-- Name: lab_results lab_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_pkey PRIMARY KEY (id);


--
-- Name: lab_tests lab_tests_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_tests
    ADD CONSTRAINT lab_tests_code_key UNIQUE (code);


--
-- Name: lab_tests lab_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_tests
    ADD CONSTRAINT lab_tests_pkey PRIMARY KEY (id);


--
-- Name: medications medications_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_code_key UNIQUE (code);


--
-- Name: medications medications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (id);


--
-- Name: patients patients_patient_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_patient_code_key UNIQUE (patient_code);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: patients patients_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_user_id_key UNIQUE (user_id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: queue_tickets queue_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tickets
    ADD CONSTRAINT queue_tickets_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_code_key UNIQUE (code);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_appointment_doctor_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_doctor_date ON public.appointments USING btree (doctor_id, appointment_date);


--
-- Name: idx_appointment_patient_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_patient_date ON public.appointments USING btree (patient_id, appointment_date);


--
-- Name: idx_appointment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_status ON public.appointments USING btree (status);


--
-- Name: idx_invoice_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_created_at ON public.invoices USING btree (created_at);


--
-- Name: idx_invoice_patient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_patient ON public.invoices USING btree (patient_id);


--
-- Name: idx_invoice_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_status ON public.invoices USING btree (status);


--
-- Name: idx_queue_date_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queue_date_status ON public.queue_tickets USING btree (queue_date, status);


--
-- Name: idx_queue_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queue_number ON public.queue_tickets USING btree (queue_number);


--
-- Name: idx_queue_room_date_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queue_room_date_status ON public.queue_tickets USING btree (room_id, queue_date, status);


--
-- Name: drug_interactions fk1pe0xk2db7jrqj2wiltqj9a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_interactions
    ADD CONSTRAINT fk1pe0xk2db7jrqj2wiltqj9a FOREIGN KEY (medication_a_id) REFERENCES public.medications(id);


--
-- Name: prescriptions fk24chc88e4so7cd6melh11rv6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fk24chc88e4so7cd6melh11rv6 FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: invoice_items fk46ae0lhu1oqs7cv91fn6y9n7w; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT fk46ae0lhu1oqs7cv91fn6y9n7w FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: follow_up_appointments fk4ip1djhj9agfphixojp2oct1w; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_appointments
    ADD CONSTRAINT fk4ip1djhj9agfphixojp2oct1w FOREIGN KEY (examination_id) REFERENCES public.examinations(id);


--
-- Name: prescription_items fk6uh7tdy2lv6sx34u1365acqsf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT fk6uh7tdy2lv6sx34u1365acqsf FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: appointments fk8exap5wmg8kmb1g1rx3by21yt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk8exap5wmg8kmb1g1rx3by21yt FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: appointments fka414dbdx50axobch6e5am3dmu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fka414dbdx50axobch6e5am3dmu FOREIGN KEY (schedule_id) REFERENCES public.doctor_schedules(id);


--
-- Name: queue_tickets fkc1sj6ljh461pacd51c2j8napx; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tickets
    ADD CONSTRAINT fkc1sj6ljh461pacd51c2j8napx FOREIGN KEY (check_in_id) REFERENCES public.check_ins(id);


--
-- Name: examinations fkd1s6r4pbghrqpx30l2i45mhph; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT fkd1s6r4pbghrqpx30l2i45mhph FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: queue_tickets fkd2rq2be3lqopictnqnk98dgfr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tickets
    ADD CONSTRAINT fkd2rq2be3lqopictnqnk98dgfr FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: drug_interactions fkdqs69cjbaj5oeblxc67a9m8tg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_interactions
    ADD CONSTRAINT fkdqs69cjbaj5oeblxc67a9m8tg FOREIGN KEY (medication_b_id) REFERENCES public.medications(id);


--
-- Name: doctors fke9pf5qtxxkdyrwibaevo9frtk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fke9pf5qtxxkdyrwibaevo9frtk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: prescription_items fkedqiiymwh98fpomx841xjuuq7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT fkedqiiymwh98fpomx841xjuuq7 FOREIGN KEY (medication_id) REFERENCES public.medications(id);


--
-- Name: doctor_schedules fkeh2pr2q3dmpk37c7g9fnwgxa4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_schedules
    ADD CONSTRAINT fkeh2pr2q3dmpk37c7g9fnwgxa4 FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: lab_orders fkfcbsc0mai7eojvuyknj1syuyl; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT fkfcbsc0mai7eojvuyknj1syuyl FOREIGN KEY (examination_id) REFERENCES public.examinations(id);


--
-- Name: examinations fkhhwmj40sjjepu3egtvgm4rb4m; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT fkhhwmj40sjjepu3egtvgm4rb4m FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: follow_up_appointments fkju3c07btkscfbbq07bat4cw1o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_appointments
    ADD CONSTRAINT fkju3c07btkscfbbq07bat4cw1o FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: lab_results fkk973ythbjpucr57e82sdobrfa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT fkk973ythbjpucr57e82sdobrfa FOREIGN KEY (performed_by_id) REFERENCES public.users(id);


--
-- Name: drug_inventory fkks56okvj7lygvklteleli6x2m; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drug_inventory
    ADD CONSTRAINT fkks56okvj7lygvklteleli6x2m FOREIGN KEY (medication_id) REFERENCES public.medications(id);


--
-- Name: doctors fkl2mro81neln9topymd898urh1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT fkl2mro81neln9topymd898urh1 FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: follow_up_appointments fklfw4tedi2kl2012kboil244y4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follow_up_appointments
    ADD CONSTRAINT fklfw4tedi2kl2012kboil244y4 FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: queue_tickets fkm55c1jht0ufuuvvfjv2asqt4n; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tickets
    ADD CONSTRAINT fkm55c1jht0ufuuvvfjv2asqt4n FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: prescriptions fkma7ho09ej09nn5ypo84mmc159; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fkma7ho09ej09nn5ypo84mmc159 FOREIGN KEY (examination_id) REFERENCES public.examinations(id);


--
-- Name: rooms fkmnnwsm0xvdd30vps6hpm92nm6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT fkmnnwsm0xvdd30vps6hpm92nm6 FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: invoices fkmoa8pimp7ftj574n7fiyxo000; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fkmoa8pimp7ftj574n7fiyxo000 FOREIGN KEY (examination_id) REFERENCES public.examinations(id);


--
-- Name: appointments fkmujeo4tymoo98cmf7uj3vsv76; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fkmujeo4tymoo98cmf7uj3vsv76 FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: invoices fkngg5bc8atao2b9jehl9l8tdsw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fkngg5bc8atao2b9jehl9l8tdsw FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: examinations fknipam88mle4u3i23mh8fiagis; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT fknipam88mle4u3i23mh8fiagis FOREIGN KEY (queue_ticket_id) REFERENCES public.queue_tickets(id);


--
-- Name: doctor_schedules fkqptts4sun4tpv6elafrnrfeup; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_schedules
    ADD CONSTRAINT fkqptts4sun4tpv6elafrnrfeup FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: check_ins fkqt7jg0qmk7ut5hfyu7nqgoaax; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT fkqt7jg0qmk7ut5hfyu7nqgoaax FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: prescriptions fkqydyol76jn1o37k1bdbkjgq74; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT fkqydyol76jn1o37k1bdbkjgq74 FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: lab_orders fkr4yt3vih8c4j7t5wta1ex84qe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT fkr4yt3vih8c4j7t5wta1ex84qe FOREIGN KEY (lab_test_id) REFERENCES public.lab_tests(id);


--
-- Name: lab_results fkre7258w851eb8muquk3vseb4o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT fkre7258w851eb8muquk3vseb4o FOREIGN KEY (lab_order_id) REFERENCES public.lab_orders(id);


--
-- Name: invoices fkrpyotno5h237hyoaokuggqqog; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fkrpyotno5h237hyoaokuggqqog FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: patients fkuwca24wcd1tg6pjex8lmc0y7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT fkuwca24wcd1tg6pjex8lmc0y7 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict WNwwhjeWgVtB1tww3oL9KDbbH7mL2ecseAUWbndt2HgZoWO6vcUXWwqQuIj8BuD

