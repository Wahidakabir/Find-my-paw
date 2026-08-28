// ============================================================
// APP.JS
// MUSARRAT'S 3 FEATURES
// ============================================================


// ============================================================
// FEATURE 1
// VACCINATION + MEDICAL RECORDS
// ============================================================

async function loadHealthRecords() {

    const petId =
        document.getElementById("health-pet-id").value.trim();


    if (!petId) {

        alert("Please enter a Pet ID.");

        return;
    }


    try {

        const response =
            await fetch(`/pets/${petId}/health`);


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Failed to load health records."
            );

            return;
        }


        // ----------------------------------------------------
        // Pet information
        // ----------------------------------------------------

        const petInfo =
            document.getElementById(
                "pet-health-info"
            );


        petInfo.innerHTML = `

            <div class="pet-info-card">

                <div>

                    <span class="pet-label">
                        PET
                    </span>

                    <h3>
                        ${escapeHTML(data.pet.Name)}
                    </h3>

                </div>

                <div class="pet-details">

                    <span>
                        Species:
                        ${escapeHTML(data.pet.Species || "N/A")}
                    </span>

                    <span>
                        Gender:
                        ${escapeHTML(data.pet.Gender || "N/A")}
                    </span>

                    <span>
                        Breed:
                        ${escapeHTML(data.pet.Breed_Name || "N/A")}
                    </span>

                    <span>
                        Color:
                        ${escapeHTML(data.pet.Color || "N/A")}
                    </span>

                </div>

            </div>

        `;


        // ----------------------------------------------------
        // Vaccinations
        // ----------------------------------------------------

        displayVaccinations(
            data.vaccinations
        );


        // ----------------------------------------------------
        // Medical records
        // ----------------------------------------------------

        displayMedicalRecords(
            data.medical_records
        );


    } catch (error) {

        console.error(
            "Health records error:",
            error
        );

        alert(
            "Could not connect to the server."
        );
    }
}


// ------------------------------------------------------------
// Display vaccination records
// ------------------------------------------------------------

function displayVaccinations(
    vaccinations
) {

    const container =
        document.getElementById(
            "vaccination-list"
        );


    container.innerHTML = "";


    if (
        !vaccinations ||
        vaccinations.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                No vaccination records found.
            </div>
        `;

        return;
    }


    vaccinations.forEach(vaccine => {

        const card =
            document.createElement("div");


        card.className =
            "vaccination-card";


        card.innerHTML = `

            <div class="record-icon">
                💉
            </div>

            <div class="record-content">

                <h4>
                    ${escapeHTML(
                        vaccine.Vaccination_name
                    )}
                </h4>

                <p>
                    Initial date:
                    ${formatDate(
                        vaccine.Initial_date
                    )}
                </p>

                <p>
                    Next due:
                    ${formatDate(
                        vaccine.Next_due_date
                    )}
                </p>

            </div>

        `;


        container.appendChild(card);

    });
}


// ------------------------------------------------------------
// Display medical records
// ------------------------------------------------------------

function displayMedicalRecords(
    records
) {

    const container =
        document.getElementById(
            "medical-list"
        );


    container.innerHTML = "";


    if (
        !records ||
        records.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                No medical records found.
            </div>
        `;

        return;
    }


    records.forEach(record => {

        const card =
            document.createElement("div");


        card.className =
            "medical-card";


        card.innerHTML = `

            <div class="record-icon">
                🩺
            </div>

            <div class="record-content">

                <h4>
                    ${escapeHTML(
                        record.Diagnosis ||
                        "No diagnosis"
                    )}
                </h4>

                <p>
                    Checkup:
                    ${formatDate(
                        record.Checkup_date
                    )}
                </p>

                <span class="status">
                    ${escapeHTML(
                        record.Treatment_status ||
                        "Not specified"
                    )}
                </span>

            </div>

        `;


        container.appendChild(card);

    });
}


// ------------------------------------------------------------
// Add vaccination
// ------------------------------------------------------------

async function addVaccinationFromPage() {

    const petId =
        document.getElementById(
            "health-pet-id"
        ).value.trim();


    const name =
        document.getElementById(
            "vaccination-name"
        ).value.trim();


    const initialDate =
        document.getElementById(
            "initial-date"
        ).value;


    const nextDueDate =
        document.getElementById(
            "next-due-date"
        ).value;


    if (!petId) {

        alert(
            "Please enter a Pet ID first."
        );

        return;
    }


    if (!name) {

        alert(
            "Please enter the vaccination name."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/pets/${petId}/vaccinations`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        Vaccination_name:
                            name,

                        Initial_date:
                            initialDate || null,

                        Next_due_date:
                            nextDueDate || null

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Failed to add vaccination."
            );

            return;
        }


        alert(
            "Vaccination added successfully!"
        );


        document.getElementById(
            "vaccination-name"
        ).value = "";


        document.getElementById(
            "initial-date"
        ).value = "";


        document.getElementById(
            "next-due-date"
        ).value = "";


        loadHealthRecords();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ------------------------------------------------------------
// Add medical record
// ------------------------------------------------------------

async function addMedicalRecordFromPage() {

    const petId =
        document.getElementById(
            "health-pet-id"
        ).value.trim();


    const checkupDate =
        document.getElementById(
            "checkup-date"
        ).value;


    const diagnosis =
        document.getElementById(
            "diagnosis"
        ).value.trim();


    const treatmentStatus =
        document.getElementById(
            "treatment-status"
        ).value.trim();


    if (!petId) {

        alert(
            "Please enter a Pet ID first."
        );

        return;
    }


    if (!diagnosis) {

        alert(
            "Please enter a diagnosis."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/pets/${petId}/medical`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        Checkup_date:
                            checkupDate || null,

                        Diagnosis:
                            diagnosis,

                        Treatment_status:
                            treatmentStatus || null

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Failed to add medical record."
            );

            return;
        }


        alert(
            "Medical record added successfully!"
        );


        document.getElementById(
            "checkup-date"
        ).value = "";


        document.getElementById(
            "diagnosis"
        ).value = "";


        document.getElementById(
            "treatment-status"
        ).value = "";


        loadHealthRecords();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ============================================================
// FEATURE 2
// FIND VETERINARIANS
// ============================================================


// ------------------------------------------------------------
// Load all veterinarians
// ------------------------------------------------------------

async function loadVeterinarians() {

    try {

        const response =
            await fetch(
                "/veterinarians"
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Failed to load veterinarians."
            );

            return;
        }


        displayVeterinarians(data);


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ------------------------------------------------------------
// Search by city
// ------------------------------------------------------------

async function searchVeterinariansByCity() {

    const city =
        document.getElementById(
            "vet-city"
        ).value.trim();


    if (!city) {

        alert(
            "Please enter a city."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/veterinarians/city/${encodeURIComponent(city)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Search failed."
            );

            return;
        }


        displayVeterinarians(data);


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ------------------------------------------------------------
// Search by area
// ------------------------------------------------------------

async function searchVeterinariansByArea() {

    const area =
        document.getElementById(
            "vet-area"
        ).value.trim();


    if (!area) {

        alert(
            "Please enter an area."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/veterinarians/area/${encodeURIComponent(area)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Search failed."
            );

            return;
        }


        displayVeterinarians(data);


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ------------------------------------------------------------
// Display veterinarians
// ------------------------------------------------------------

function displayVeterinarians(
    veterinarians
) {

    const container =
        document.getElementById(
            "veterinarian-list"
        );


    container.innerHTML = "";


    if (
        !veterinarians ||
        veterinarians.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                No veterinarians found.
            </div>
        `;

        return;
    }


    veterinarians.forEach(vet => {

        const card =
            document.createElement("div");


        card.className =
            "veterinarian-card";


        card.innerHTML = `

            <div class="vet-top">

                <div class="vet-icon">
                    🩺
                </div>

                <div>

                    <h3>
                        ${escapeHTML(
                            vet.Clinic_Name
                        )}
                    </h3>

                    <p class="doctor">
                        ${escapeHTML(
                            vet.Doctor_Name
                        )}
                    </p>

                </div>

            </div>


            <div class="vet-details">

                <p>
                    <strong>
                        Specialization:
                    </strong>

                    ${escapeHTML(
                        vet.Specialization ||
                        "General Veterinary Medicine"
                    )}
                </p>

                <p>
                    <strong>
                        Address:
                    </strong>

                    ${escapeHTML(
                        vet.Street_Address ||
                        "N/A"
                    )}
                </p>

                <p>
                    <strong>
                        City:
                    </strong>

                    ${escapeHTML(
                        vet.City ||
                        "N/A"
                    )}
                </p>

                <p>
                    <strong>
                        Phone:
                    </strong>

                    ${escapeHTML(
                        vet.Phone_Number ||
                        "N/A"
                    )}
                </p>

                <p>
                    <strong>
                        Email:
                    </strong>

                    ${escapeHTML(
                        vet.Email ||
                        "N/A"
                    )}
                </p>

            </div>


            ${
                vet.Website
                    ? `
                    <a
                        href="${escapeAttribute(
                            vet.Website
                        )}"
                        target="_blank"
                        class="website-button"
                    >
                        Visit Website
                    </a>
                    `
                    : ""
            }

        `;


        container.appendChild(card);

    });
}


// ============================================================
// FEATURE 3
// LOST AND FOUND PETS
// ============================================================


// ------------------------------------------------------------
// Load all reports
// ------------------------------------------------------------

async function loadPetReports() {

    try {

        const response =
            await fetch(
                "/pet-reports"
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Failed to load reports."
            );

            return;
        }


        displayPetReports(data);


        setActiveFilter("all");


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ------------------------------------------------------------
// Load lost pets
// ------------------------------------------------------------

async function loadLostPets() {

    try {

        const response =
            await fetch(
                "/pet-reports/lost"
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Failed to load lost pets."
            );

            return;
        }


        displayPetReports(data);

        setActiveFilter("lost");


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ------------------------------------------------------------
// Load found pets
// ------------------------------------------------------------

async function loadFoundPets() {

    try {

        const response =
            await fetch(
                "/pet-reports/found"
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Failed to load found pets."
            );

            return;
        }


        displayPetReports(data);

        setActiveFilter("found");


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ------------------------------------------------------------
// Display reports
// ------------------------------------------------------------

function displayPetReports(
    reports
) {

    const container =
        document.getElementById(
            "pet-report-list"
        );


    container.innerHTML = "";


    if (
        !reports ||
        reports.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                No reports found.
            </div>
        `;

        return;
    }


    reports.forEach(report => {

        const card =
            document.createElement("div");


        card.className =
            "pet-report-card";


        const type =
            String(
                report.Report_Type || ""
            ).toLowerCase();


        const typeClass =
            type === "lost"
                ? "lost"
                : "found";


        const image =
            report.Pet_pic_url
                ? `
                    <img
                        src="${escapeAttribute(
                            report.Pet_pic_url
                        )}"
                        alt="Pet"
                        class="pet-report-image"
                        onerror="this.style.display='none'"
                    >
                  `
                : "";


        const locationLink =
            report.Share_location_url
                ? `
                    <a
                        href="${escapeAttribute(
                            report.Share_location_url
                        )}"
                        target="_blank"
                        class="location-link"
                    >
                        📍 View Location
                    </a>
                  `
                : "";


        card.innerHTML = `

            ${image}


            <div class="report-body">

                <div class="report-heading">

                    <span
                        class="report-type ${typeClass}"
                    >
                        ${escapeHTML(
                            report.Report_Type ||
                            "Report"
                        )}
                    </span>

                    <span class="report-status">
                        ${escapeHTML(
                            report.Status ||
                            "Open"
                        )}
                    </span>

                </div>


                <h3>
                    ${escapeHTML(
                        report.Pet_name ||
                        "Unknown Pet"
                    )}
                </h3>


                <p>
                    <strong>
                        Species:
                    </strong>

                    ${escapeHTML(
                        report.Species ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>
                        Breed:
                    </strong>

                    ${escapeHTML(
                        report.Breed_Name ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>
                        Color:
                    </strong>

                    ${escapeHTML(
                        report.Color ||
                        "N/A"
                    )}
                </p>


                <p class="description">
                    ${escapeHTML(
                        report.Description ||
                        "No description"
                    )}
                </p>


                <div class="report-location">

                    <p>
                        📍

                        ${escapeHTML(
                            report.AreaName ||
                            "Unknown area"
                        )},

                        ${escapeHTML(
                            report.City ||
                            "Unknown city"
                        )}
                    </p>

                    ${locationLink}

                </div>


                <p class="report-date">

                    Reported:
                    ${formatDate(
                        report.Report_Date
                    )}

                </p>

            </div>

        `;


        container.appendChild(card);

    });
}


// ------------------------------------------------------------
// Submit report
// ------------------------------------------------------------

async function submitPetReport() {

    const data = {

        Last_seen_Date:
            document.getElementById(
                "last-seen-date"
            ).value || null,

        Description:
            document.getElementById(
                "report-description"
            ).value.trim(),

        User_ID:
            document.getElementById(
                "report-user-id"
            ).value || null,

        Pet_ID:
            document.getElementById(
                "report-pet-id"
            ).value || null,

        Report_Type:
            document.getElementById(
                "report-type"
            ).value,

        Status:
            "Open",

        Report_Date:
            new Date()
                .toISOString()
                .split("T")[0],

        Pet_pic_url:
            document.getElementById(
                "pet-picture"
            ).value.trim() || null,

        Identifying_mark:
            document.getElementById(
                "identifying-mark"
            ).value.trim() || null,

        Zip_code:
            document.getElementById(
                "zip-code"
            ).value.trim() || null,

        City:
            document.getElementById(
                "report-city"
            ).value.trim(),

        AreaName:
            document.getElementById(
                "report-area"
            ).value.trim(),

        Share_location_url:
            document.getElementById(
                "location-url"
            ).value.trim() || null

    };


    if (!data.Description) {

        alert(
            "Please enter a description."
        );

        return;
    }


    if (!data.City) {

        alert(
            "Please enter the city."
        );

        return;
    }


    if (!data.AreaName) {

        alert(
            "Please enter the area."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/pet-reports",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Failed to submit report."
            );

            return;
        }


        alert(
            "Pet report submitted successfully!"
        );


        document.getElementById(
            "report-form"
        ).reset();


        loadPetReports();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ============================================================
// UPDATE REPORT STATUS
// ============================================================

async function updatePetReportStatus(
    reportId,
    status
) {

    try {

        const response =
            await fetch(
                `/pet-reports/${reportId}/status`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        Status: status
                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Failed to update status."
            );

            return;
        }


        loadPetReports();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the server."
        );
    }
}


// ============================================================
// FILTER BUTTON
// ============================================================

function setActiveFilter(
    filter
) {

    document
        .querySelectorAll(".filter")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const activeButton =
        document.querySelector(
            `.filter[data-filter="${filter}"]`
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );
    }
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatDate(date) {

    if (!date) {
        return "N/A";
    }


    const d =
        new Date(date);


    if (Number.isNaN(d.getTime())) {
        return date;
    }


    return d.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadVeterinarians();

        loadPetReports();

    }
);