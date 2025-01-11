document.addEventListener("DOMContentLoaded", () => {
  const jobList = document.getElementById("jobList");
  const jobForm = document.getElementById("jobForm");
  const filterInput = document.getElementById("filterInput");
  const filterLocation = document.getElementById("filterLocation");
  const filterExperience = document.getElementById("filterExperience");
  const filterCTC = document.getElementById("filterCTC");
  const filterRoleType = document.getElementById("filterRoleType");
  const filterJobID = document.getElementById("filterJobID");
  const editButton = document.getElementById("editButton");
  const deleteButton = document.getElementById("deleteButton");
  const saveButton = document.getElementById("saveButton");
  const jobIdSearch = document.getElementById("jobIdSearch");
  const adminPasswordInput = document.getElementById("adminPassword");

  let passwordAttempts = 0;
  const maxAttempts = 3;
  let passwordVerified = false;
  let currentEditingIndex = -1;

  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  // Password Validation
  document.getElementById("verifyPassword").addEventListener("click", () => {
    const enteredPassword = adminPasswordInput.value.trim();

    if (enteredPassword === "MINDLEAD2004") {
      passwordVerified = true;
      alert("Password verified successfully. You can now manage jobs.");
      jobForm.classList.remove("d-none");
    } else {
      passwordAttempts++;
      if (passwordAttempts >= maxAttempts) {
        showWarningPopup();
      } else {
        alert(`Incorrect password. You have ${maxAttempts - passwordAttempts} attempts remaining.`);
      }
    }
  });

  function showWarningPopup() {
    const modalHtml = `
      <div id="warningPopup" class="modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">Warning</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>You have exceeded the maximum number of password attempts. Please try again later.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    const warningPopup = new bootstrap.Modal(document.getElementById("warningPopup"));
    warningPopup.show();
  }

  // Add Job
  jobForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const ctc = document.getElementById("ctc").value;
    const experience = document.getElementById("experience").value;
    const description = document.getElementById("description").innerHTML;
    const roleType = document.getElementById("roleType").value;
    const applicationLink = document.getElementById("applicationLink").value;
    const jobID = document.getElementById("jobId").value.trim().toLowerCase();
    const dateAdded = new Date().toLocaleDateString("en-GB");

    if (jobs.some((job) => job.jobID === jobID)) {
      alert("Job ID must be unique. Please enter a different Job ID.");
      return;
    }

    jobs.push({
      title,
      location,
      ctc,
      experience,
      description,
      roleType,
      applicationLink,
      jobID,
      dateAdded,
    });

    localStorage.setItem("jobs", JSON.stringify(jobs));
    renderJobs();
    jobForm.reset();
    alert("Job added successfully.");
  });

  function renderJobs(filter = "") {
    jobList.innerHTML = "";

    const filterJobIDValue = filterJobID.value ? filterJobID.value.toLowerCase() : "";

    const filteredJobs = jobs.filter((job) => {
      const matchesSearch = job.title && job.title.toLowerCase().includes(filter.toLowerCase());
      const matchesJobID = !filterJobIDValue || (job.jobID && job.jobID.toLowerCase().includes(filterJobIDValue));
      const matchesLocation = !filterLocation.value || 
        (job.location && job.location.toLowerCase() === filterLocation.value.toLowerCase());
      const matchesExperience = !filterExperience.value || 
        (job.experience && checkExperienceMatch(job.experience, filterExperience.value));
      const matchesCTC = !filterCTC.value || 
        (job.ctc && checkCTCMatch(job.ctc, filterCTC.value));
      const matchesRoleType = !filterRoleType.value || 
        (job.roleType && job.roleType.toLowerCase() === filterRoleType.value.toLowerCase());

      return (
        matchesSearch &&
        matchesJobID &&
        matchesLocation &&
        matchesExperience &&
        matchesCTC &&
        matchesRoleType
      );
    });

    if (filteredJobs.length === 0) {
      jobList.innerHTML = `<p class="text-center">No jobs found matching the criteria.</p>`;
      return;
    }

    filteredJobs.forEach((job) => {
      const jobCard = document.createElement("div");
      jobCard.classList.add("card", "mb-3");
      jobCard.innerHTML = `
        <div class="card-body">
          <div>
            <h5 class="card-title">${job.title}</h5>
            <p>
              <strong>Job ID:</strong> ${job.jobID} | 
              <strong>Role Type:</strong> ${job.roleType} | 
              <strong>Location:</strong> ${job.location} | 
              <strong>CTC:</strong> ${job.ctc} | 
              <strong>Experience:</strong> ${job.experience} Years | 
              <strong>Date Added:</strong> ${job.dateAdded}
            </p>
          </div>
          <div class="d-flex justify-content-between">
            <button class="btn btn-primary view-button" onclick="toggleDescription(this)">View</button>
            <button class="btn btn-success share-button" onclick="shareJob('${job.title}')">Share</button>
            <button class="btn btn-info apply-button" onclick="applyJob('${job.applicationLink}')">Apply</button>
          </div>
          <div class="full-description mt-3" style="display: none;">
            <div>${job.description}</div>
          </div>
        </div>
      `;
      jobList.appendChild(jobCard);
    });
  }

  function checkExperienceMatch(jobExperience, filterValue) {
    const [min, max] = filterValue.split("-").map(Number);
    const jobYears = Number(jobExperience.split(" ")[0]);
    return jobYears >= min && (!max || jobYears <= max);
  }

  function checkCTCMatch(jobCTC, filterValue) {
    const [min, max] = filterValue.split("-").map(Number);
    const jobSalary = parseFloat(jobCTC);
    return jobSalary >= min && (!max || jobSalary <= max);
  }

  // Edit Job
  editButton.addEventListener("click", () => {
    if (!passwordVerified) {
      alert("Please verify the password before performing any action.");
      return;
    }

    const jobId = jobIdSearch.value.trim().toLowerCase();
    const jobIndex = jobs.findIndex((job) => job.jobID === jobId);

    if (jobIndex === -1) {
      alert("Job ID not found. Please enter a valid Job ID.");
      return;
    }

    currentEditingIndex = jobIndex;
    const job = jobs[jobIndex];

    document.getElementById("title").value = job.title || "";
    document.getElementById("location").value = job.location || "";
    document.getElementById("ctc").value = job.ctc || "";
    document.getElementById("experience").value = job.experience || "";
    document.getElementById("description").innerHTML = job.description || "";
    document.getElementById("roleType").value = job.roleType || "";

    saveButton.classList.remove("d-none");
    alert("Job details loaded. You can now edit the job.");
  });

  // Save Edited Job
  saveButton.addEventListener("click", () => {
    if (!passwordVerified) {
      alert("Please verify the password before performing any action.");
      return;
    }

    if (currentEditingIndex === -1) {
      alert("No job selected for editing.");
      return;
    }

    jobs[currentEditingIndex] = {
      title: document.getElementById("title").value,
      location: document.getElementById("location").value,
      ctc: document.getElementById("ctc").value,
      experience: document.getElementById("experience").value,
      description: document.getElementById("description").innerHTML,
      roleType: document.getElementById("roleType").value,
      jobID: jobs[currentEditingIndex].jobID,
      dateAdded: jobs[currentEditingIndex].dateAdded,
    };

    localStorage.setItem("jobs", JSON.stringify(jobs));
    renderJobs();
    jobForm.reset();
    saveButton.classList.add("d-none");
    alert("Job details updated successfully.");
  });

  // Filter Jobs
  filterInput.addEventListener("input", (e) => {
    renderJobs(e.target.value);
  });

  document.getElementById("applyFilters").addEventListener("click", () => {
    renderJobs(filterInput.value);
  });

  renderJobs();
});
