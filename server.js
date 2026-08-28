const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Database connection
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "pet_platform",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// ============================================================
// TEST DATABASE CONNECTION
// ============================================================

app.get("/api/test", async (req, res) => {
    try {

        await db.query("SELECT 1");

        res.json({
            success: true,
            message: "Database connection successful"
        });

    } catch (error) {

        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            error: "Database connection failed"
        });
    }
});


// ============================================================
// EXISTING PET ROUTE
// ============================================================

app.get("/pet", async (req, res) => {

    try {

        res.set("Cache-Control", "no-store");

        const [rows] = await db.query(
            "SELECT * FROM pet"
        );

        res.json(rows);

    } catch (error) {

        console.error("Pet database error:", error);

        res.status(500).json({
            error: "Failed to fetch pets"
        });
    }
});


// ============================================================
// FEATURE 1
// KEEP VACCINATION AND MEDICAL RECORDS
// ============================================================


// ------------------------------------------------------------
// Get one pet + vaccination + medical records
// ------------------------------------------------------------

app.get("/pets/:id/health", async (req, res) => {

    const petId = Number(req.params.id);

    if (!Number.isInteger(petId) || petId <= 0) {

        return res.status(400).json({
            error: "Invalid Pet ID"
        });
    }

    try {

        const [pet] = await db.query(
            `
            SELECT
                Pet_id,
                Name,
                Species,
                Gender,
                Breed_Name,
                Color,
                Date_of_birth,
                Adoption_status
            FROM pet
            WHERE Pet_id = ?
            `,
            [petId]
        );


        if (pet.length === 0) {

            return res.status(404).json({
                error: "Pet not found"
            });
        }


        const [vaccinations] = await db.query(
            `
            SELECT
                Vaccination_name,
                Pet_id,
                Initial_date,
                Next_due_date
            FROM vaccination
            WHERE Pet_id = ?
            ORDER BY Next_due_date ASC
            `,
            [petId]
        );


        const [medical_records] = await db.query(
            `
            SELECT
                Medical_id,
                Checkup_date,
                Pet_id,
                Diagnosis,
                Treatment_status
            FROM medical_record
            WHERE Pet_id = ?
            ORDER BY Checkup_date DESC
            `,
            [petId]
        );


        res.json({
            pet: pet[0],
            vaccinations: vaccinations,
            medical_records: medical_records
        });


    } catch (error) {

        console.error(
            "Health records error:",
            error
        );

        res.status(500).json({
            error: "Failed to load health records"
        });
    }
});


// ------------------------------------------------------------
// Add vaccination
// ------------------------------------------------------------

app.post("/pets/:id/vaccinations", async (req, res) => {

    const petId = Number(req.params.id);

    const {
        Vaccination_name,
        Initial_date,
        Next_due_date
    } = req.body;


    if (!Number.isInteger(petId) || petId <= 0) {

        return res.status(400).json({
            error: "Invalid Pet ID"
        });
    }


    if (!Vaccination_name) {

        return res.status(400).json({
            error: "Vaccination name is required"
        });
    }


    try {

        // Check whether pet exists
        const [pet] = await db.query(
            "SELECT Pet_id FROM pet WHERE Pet_id = ?",
            [petId]
        );


        if (pet.length === 0) {

            return res.status(404).json({
                error: "Pet not found"
            });
        }


        await db.query(
            `
            INSERT INTO vaccination
            (
                Vaccination_name,
                Pet_id,
                Initial_date,
                Next_due_date
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                Vaccination_name,
                petId,
                Initial_date || null,
                Next_due_date || null
            ]
        );


        res.status(201).json({
            success: true,
            message: "Vaccination record added successfully"
        });


    } catch (error) {

        console.error(
            "Add vaccination error:",
            error
        );


        // Duplicate vaccination
        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                error:
                    "This vaccination already exists for this pet."
            });
        }


        res.status(500).json({
            error: "Failed to add vaccination record"
        });
    }
});


// ------------------------------------------------------------
// Add medical record
// ------------------------------------------------------------

app.post("/pets/:id/medical", async (req, res) => {

    const petId = Number(req.params.id);

    const {
        Checkup_date,
        Diagnosis,
        Treatment_status
    } = req.body;


    if (!Number.isInteger(petId) || petId <= 0) {

        return res.status(400).json({
            error: "Invalid Pet ID"
        });
    }


    if (!Diagnosis) {

        return res.status(400).json({
            error: "Diagnosis is required"
        });
    }


    try {

        // Check whether pet exists
        const [pet] = await db.query(
            "SELECT Pet_id FROM pet WHERE Pet_id = ?",
            [petId]
        );


        if (pet.length === 0) {

            return res.status(404).json({
                error: "Pet not found"
            });
        }


        await db.query(
            `
            INSERT INTO medical_record
            (
                Checkup_date,
                Pet_id,
                Diagnosis,
                Treatment_status
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                Checkup_date || null,
                petId,
                Diagnosis,
                Treatment_status || null
            ]
        );


        res.status(201).json({
            success: true,
            message:
                "Medical record added successfully"
        });


    } catch (error) {

        console.error(
            "Add medical record error:",
            error
        );

        res.status(500).json({
            error: "Failed to add medical record"
        });
    }
});


// ============================================================
// FEATURE 2
// FIND NEARBY VETERINARIANS
// ============================================================


// ------------------------------------------------------------
// Get all veterinarians
// ------------------------------------------------------------

app.get("/veterinarians", async (req, res) => {

    try {

        const [rows] = await db.query(
            `
            SELECT
                Vet_ID,
                Clinic_Name,
                Doctor_Name,
                Website,
                Specialization,
                Email,
                Phone_Number,
                Street_Address,
                City,
                Zip_Code
            FROM veterinarian
            ORDER BY City, Clinic_Name
            `
        );


        res.json(rows);


    } catch (error) {

        console.error(
            "Veterinarian error:",
            error
        );

        res.status(500).json({
            error:
                "Failed to load veterinarians"
        });
    }
});


// ------------------------------------------------------------
// Search veterinarian by city
// ------------------------------------------------------------

app.get(
    "/veterinarians/city/:city",
    async (req, res) => {

        const city = req.params.city;

        try {

            const [rows] = await db.query(
                `
                SELECT
                    Vet_ID,
                    Clinic_Name,
                    Doctor_Name,
                    Website,
                    Specialization,
                    Email,
                    Phone_Number,
                    Street_Address,
                    City,
                    Zip_Code
                FROM veterinarian
                WHERE LOWER(City) = LOWER(?)
                ORDER BY Clinic_Name
                `,
                [city]
            );


            res.json(rows);


        } catch (error) {

            console.error(
                "Veterinarian city search error:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to search veterinarians"
            });
        }
    }
);


// ------------------------------------------------------------
// Search veterinarian by area
// ------------------------------------------------------------

app.get(
    "/veterinarians/area/:area",
    async (req, res) => {

        const area = req.params.area;

        try {

            const [rows] = await db.query(
                `
                SELECT
                    Vet_ID,
                    Clinic_Name,
                    Doctor_Name,
                    Website,
                    Specialization,
                    Email,
                    Phone_Number,
                    Street_Address,
                    City,
                    Zip_Code
                FROM veterinarian
                WHERE
                    LOWER(Street_Address) LIKE LOWER(?)
                    OR LOWER(City) LIKE LOWER(?)
                ORDER BY Clinic_Name
                `,
                [
                    `%${area}%`,
                    `%${area}%`
                ]
            );


            res.json(rows);


        } catch (error) {

            console.error(
                "Veterinarian area search error:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to search veterinarians"
            });
        }
    }
);


// ============================================================
// FEATURE 3
// REPORT LOST AND FOUND PETS
// ============================================================


// ------------------------------------------------------------
// Get all reports
// ------------------------------------------------------------

app.get("/pet-reports", async (req, res) => {

    try {

        const [rows] = await db.query(
            `
            SELECT
                pr.Report_ID,
                pr.Last_seen_Date,
                pr.Description,
                pr.User_ID,
                pr.Pet_ID,
                pr.Report_Type,
                pr.Status,
                pr.Report_Date,
                pr.Pet_pic_url,
                pr.Identifying_mark,
                pr.Zip_code,
                pr.City,
                pr.AreaName,
                pr.Share_location_url,

                p.Name AS Pet_name,
                p.Species,
                p.Gender,
                p.Breed_Name,
                p.Color

            FROM pet_report pr

            LEFT JOIN pet p
                ON pr.Pet_ID = p.Pet_id

            ORDER BY pr.Report_Date DESC
            `
        );


        res.json(rows);


    } catch (error) {

        console.error(
            "Pet reports error:",
            error
        );

        res.status(500).json({
            error:
                "Failed to load pet reports"
        });
    }
});


// ------------------------------------------------------------
// Get LOST pets
// ------------------------------------------------------------

app.get("/pet-reports/lost", async (req, res) => {

    try {

        const [rows] = await db.query(
            `
            SELECT
                pr.Report_ID,
                pr.Last_seen_Date,
                pr.Description,
                pr.User_ID,
                pr.Pet_ID,
                pr.Report_Type,
                pr.Status,
                pr.Report_Date,
                pr.Pet_pic_url,
                pr.Identifying_mark,
                pr.Zip_code,
                pr.City,
                pr.AreaName,
                pr.Share_location_url,

                p.Name AS Pet_name,
                p.Species,
                p.Gender,
                p.Breed_Name,
                p.Color

            FROM pet_report pr

            LEFT JOIN pet p
                ON pr.Pet_ID = p.Pet_id

            WHERE LOWER(pr.Report_Type) = 'lost'

            ORDER BY pr.Report_Date DESC
            `
        );


        res.json(rows);


    } catch (error) {

        console.error(
            "Lost pets error:",
            error
        );

        res.status(500).json({
            error:
                "Failed to load lost pets"
        });
    }
});


// ------------------------------------------------------------
// Get FOUND pets
// ------------------------------------------------------------

app.get("/pet-reports/found", async (req, res) => {

    try {

        const [rows] = await db.query(
            `
            SELECT
                pr.Report_ID,
                pr.Last_seen_Date,
                pr.Description,
                pr.User_ID,
                pr.Pet_ID,
                pr.Report_Type,
                pr.Status,
                pr.Report_Date,
                pr.Pet_pic_url,
                pr.Identifying_mark,
                pr.Zip_code,
                pr.City,
                pr.AreaName,
                pr.Share_location_url,

                p.Name AS Pet_name,
                p.Species,
                p.Gender,
                p.Breed_Name,
                p.Color

            FROM pet_report pr

            LEFT JOIN pet p
                ON pr.Pet_ID = p.Pet_id

            WHERE LOWER(pr.Report_Type) = 'found'

            ORDER BY pr.Report_Date DESC
            `
        );


        res.json(rows);


    } catch (error) {

        console.error(
            "Found pets error:",
            error
        );

        res.status(500).json({
            error:
                "Failed to load found pets"
        });
    }
});


// ------------------------------------------------------------
// Submit lost/found report
// ------------------------------------------------------------

app.post("/pet-reports", async (req, res) => {

    const {
        Last_seen_Date,
        Description,
        User_ID,
        Pet_ID,
        Report_Type,
        Status,
        Report_Date,
        Pet_pic_url,
        Identifying_mark,
        Zip_code,
        City,
        AreaName,
        Share_location_url
    } = req.body;


    if (!Report_Type) {

        return res.status(400).json({
            error: "Report type is required"
        });
    }


    if (!Description) {

        return res.status(400).json({
            error: "Description is required"
        });
    }


    if (!City) {

        return res.status(400).json({
            error: "City is required"
        });
    }


    if (!AreaName) {

        return res.status(400).json({
            error: "Area is required"
        });
    }


    try {

        await db.query(
            `
            INSERT INTO pet_report
            (
                Last_seen_Date,
                Description,
                User_ID,
                Pet_ID,
                Report_Type,
                Status,
                Report_Date,
                Pet_pic_url,
                Identifying_mark,
                Zip_code,
                City,
                AreaName,
                Share_location_url
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                Last_seen_Date || null,
                Description,
                User_ID || null,
                Pet_ID || null,
                Report_Type,
                Status || "Open",
                Report_Date ||
                    new Date()
                        .toISOString()
                        .split("T")[0],
                Pet_pic_url || null,
                Identifying_mark || null,
                Zip_code || null,
                City,
                AreaName,
                Share_location_url || null
            ]
        );


        res.status(201).json({
            success: true,
            message:
                "Pet report submitted successfully"
        });


    } catch (error) {

        console.error(
            "Submit pet report error:",
            error
        );

        res.status(500).json({
            error:
                "Failed to submit pet report"
        });
    }
});


// ------------------------------------------------------------
// Update report status
// ------------------------------------------------------------

app.put(
    "/pet-reports/:id/status",
    async (req, res) => {

        const reportId =
            Number(req.params.id);

        const { Status } = req.body;


        if (
            !Number.isInteger(reportId) ||
            reportId <= 0
        ) {

            return res.status(400).json({
                error: "Invalid Report ID"
            });
        }


        if (!Status) {

            return res.status(400).json({
                error: "Status is required"
            });
        }


        try {

            const [result] =
                await db.query(
                    `
                    UPDATE pet_report
                    SET Status = ?
                    WHERE Report_ID = ?
                    `,
                    [
                        Status,
                        reportId
                    ]
                );


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    error: "Report not found"
                });
            }


            res.json({
                success: true,
                message:
                    "Report status updated"
            });


        } catch (error) {

            console.error(
                "Update report status error:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to update report status"
            });
        }
    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});