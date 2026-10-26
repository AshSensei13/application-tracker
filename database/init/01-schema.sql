-- Remove existing tables when rebuilding the development schema.
-- CASCADE also removes dependent database objects.
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Store each company once.
CREATE TABLE companies (
    company_id INT GENERATED ALWAYS AS IDENTITY,
    company_name VARCHAR(150) NOT NULL,
    company_website VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_companies
        PRIMARY KEY (company_id),

    CONSTRAINT uq_companies_company_name
        UNIQUE (company_name)
);

-- Store individual applications submitted to companies.
CREATE TABLE job_applications (
    application_id INT GENERATED ALWAYS AS IDENTITY,
    company_id INT NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    job_description TEXT,
    job_url VARCHAR(2048),
    application_status VARCHAR(30) NOT NULL DEFAULT 'saved',
    date_applied DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_job_applications
        PRIMARY KEY (application_id),

    CONSTRAINT fk_job_applications_company
        FOREIGN KEY (company_id)
        REFERENCES companies (company_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_job_applications_status
        CHECK (
            application_status IN (
                'saved',
                'applied',
                'assessment',
                'interview',
                'offer',
                'rejected',
                'withdrawn'
            )
        )
);

-- Speed up queries that retrieve applications for a company.
CREATE INDEX idx_job_applications_company_id
    ON job_applications (company_id);

-- Speed up filtering applications by status.
CREATE INDEX idx_job_applications_status
    ON job_applications (application_status);
