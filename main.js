
document.addEventListener('DOMContentLoaded', () => {

    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const resumeContainer = document.getElementById('resume-container');
    const themeSwitcher = document.getElementById('theme-switcher');

    // --- انیمیشن پس‌زمینه ---
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let chars = "01";
    let particles = [];
    const particleCount = Math.floor(canvas.width / 20);

    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                char: chars[Math.floor(Math.random() * chars.length)]
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const themeColor = document.body.classList.contains('dark-theme') ? '#8a84e2' : '#5D54A4';
        ctx.fillStyle = themeColor;
        ctx.font = '14px monospace';

        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i];
            ctx.fillText(particle.char, particle.x, particle.y);
            particle.y += 1;
            if (particle.y > canvas.height) {
                particle.y = 0;
                particle.x = Math.random() * canvas.width;
            }
        }
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    });

    createParticles();
    setInterval(draw, 50);

    // ---  تم ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeSwitcher.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            themeSwitcher.textContent = '🌙';
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeSwitcher.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- انیمیشن هنگام اسکرول ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1 
    });

    function observeCards() {
        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach(el => observer.observe(el));
    }


    function renderPersonalInfo(data) {
        const container = document.getElementById('personal-info');
        if (!data) return;

        container.innerHTML = `
            <img src="${data.profilePicture}" alt="Profile picture of ${data.name}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/cccccc/ffffff?text=Error';">
            <h1>${data.name}</h1>
            <p class="title">${data.title}</p>
            <p class="bio">${data.bio}</p>
            <div class="contact-links">
                <a href="mailto:${data.contact.email}" target="_blank">Email</a> |
                <a href="${data.contact.linkedin}" target="_blank">LinkedIn</a> |
                <a href="${data.contact.github}" target="_blank">GitHub</a>
            </div>
        `;
    }

    function renderSkills(skills) {
        const container = document.getElementById('skills-container');
        if (!skills) return;
        container.innerHTML = skills.map(skill => `
            <div class="skill">
                <div class="skill-info">
                    <span>${skill.name} (${skill.level})</span>
                    <span>${skill.value}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${skill.value}%;"></div>
                </div>
            </div>
        `).join('');
    }

    function renderEducation(education) {
        const container = document.getElementById('education-container');
        if (!education) return;
        container.innerHTML = education.map(edu => `
            <div class="entry">
                <h3>${edu.degree}</h3>
                <p><strong>${edu.institution}</strong></p>
                <p class="period">${edu.status}</p>
                <p>${edu.description}</p>
            </div>
        `).join('');
    }

    function renderExperience(experience) {
        const container = document.getElementById('experience-container');
        if (!experience) return;
        container.innerHTML = experience.map(exp => `
            <div class="entry">
                <h3>${exp.role}</h3>
                <p><strong>${exp.company}</strong></p>
                <p class="period">${exp.startYear} - ${exp.endYear}</p>
                <p>${exp.description}</p>
            </div>
        `).join('');
    }

    function renderAchievements(achievements) {
        const container = document.getElementById('achievements-container');
        if (!achievements || achievements.length === 0) {
            container.parentElement.style.display = 'none';
            return;
        }
        container.innerHTML = achievements.map(ach => `
            <li><a href="${ach.link}" target="_blank">${ach.title}</a> - ${ach.issuer} (${ach.date})</li>
        `).join('');
    }

    function renderInterests(interests) {
        const container = document.getElementById('interests-container');
        if (!interests || interests.length === 0) {
            container.parentElement.style.display = 'none';
            return;
        }
        container.innerHTML = interests.map(interest => `<li>${interest}</li>`).join('');
    }

    //   برای رندر کل رزومه
    function renderResume(data) {
        renderPersonalInfo(data.personalInfo);
        renderSkills(data.skills);
        renderEducation(data.education);
        renderExperience(data.experience);
        renderAchievements(data.achievements);
        renderInterests(data['interests/']); 
        
        loader.style.display = 'none';
        resumeContainer.style.display = 'block';

        observeCards();
    }
    
    //  نمایش ارور
    function showError() {
        loader.style.display = 'none';
        errorMessage.style.display = 'flex';
    }

  
    const API_URL = 'https://faezeh-resume-api.onrender.com/api/resume';    

    const LOCAL_JSON_URL = 'resume.json';

    async function loadResumeData() {
        try {
            // ابتدا تلاش برای دریافت داده از API واقعی
            console.log(`Trying to get data from API: ${API_URL}`);
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Failed to retrieve from API, trying to read local file...');
            }
            const data = await response.json();
            console.log('Data successfully retrieved from API.');
            renderResume(data);
        } catch (error) {
            // اگر API در دسترس نبود، از فایل محلی استفاده کن
            console.warn(error.message);
            console.log(`Trying to read local file: ${LOCAL_JSON_URL}`);
            try {
                const response = await fetch(LOCAL_JSON_URL);
                const data = await response.json();
                console.log('Data successfully retrieved from local file.');
                renderResume(data);
            } catch (localError) {
                // اگر هیچکدام کار نکردند، خطا نمایش بده
                console.error("Error reading local file:", localError);
                showError();
            }
        }
    }

    // شروع بارگذاری داده‌ها
    loadResumeData();
});
