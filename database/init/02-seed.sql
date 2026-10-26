
-- Insert example companies.
INSERT INTO companies (company_name, company_website)
VALUES
    ('Microsoft', 'https://www.microsoft.com'),
    ('BBC', 'https://www.bbc.co.uk'),
    ('Sky', 'https://www.sky.com');

-- Insert example job applications.
INSERT INTO job_applications (
    company_id,
    job_title,
    job_description,
    job_url,
    application_status,
    date_applied
)
VALUES
    (
        (SELECT company_id FROM companies
         WHERE company_name = 'Microsoft'),
        'Junior Software Engineer',
        'Develop and maintain software applications.',
        'https://www.microsoft.com',
        'applied',
        CURRENT_DATE - 7
    ),
    (
        (SELECT company_id FROM companies
         WHERE company_name = 'Microsoft'),
        'Software Test Engineer',
        'Create and maintain automated software tests.',
        'https://www.microsoft.com',
        'interview',
        CURRENT_DATE - 14
    ),
    (
        (SELECT company_id FROM companies
         WHERE company_name = 'BBC'),
        'Junior QA Engineer',
        'Support quality assurance and regression testing.',
        'https://www.bbc.co.uk',
        'saved',
        NULL
    ),
    (
        (SELECT company_id FROM companies
         WHERE company_name = 'Sky'),
        'IT Support Engineer',
        'Troubleshoot technical issues and support users.',
        'https://www.sky.com',
        'rejected',
        CURRENT_DATE - 30
    );
