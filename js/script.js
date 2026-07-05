document.addEventListener('DOMContentLoaded', () => {
  const dynamicText = document.getElementById('dynamic-text');
  const galleryImages = document.querySelectorAll('[data-gallery-image]');

  if (dynamicText) {
    const messages = [
      'Hello and welcome!',
      'Currently researching dynamical systems.',
      'Reviewing papers for the upcoming journal.',
      'Open to collaboration, mentoring, and new ideas.'
    ];

    let messageIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    let pauseTicks = 0;

    function typeLoop() {
      const currentMessage = messages[messageIndex];

      if (pauseTicks > 0) {
        pauseTicks -= 1;
        setTimeout(typeLoop, 120);
        return;
      }

      if (!isDeleting) {
        characterIndex += 1;
        dynamicText.textContent = currentMessage.slice(0, characterIndex);

        if (characterIndex === currentMessage.length) {
          isDeleting = true;
          pauseTicks = 20;
        }
      } else {
        characterIndex -= 1;
        dynamicText.textContent = currentMessage.slice(0, characterIndex);

        if (characterIndex === 0) {
          isDeleting = false;
          messageIndex = (messageIndex + 1) % messages.length;
          pauseTicks = 8;
        }
      }

      const speed = isDeleting ? 45 : 75;
      setTimeout(typeLoop, speed);
    }

    typeLoop();
  }

  async function renderPublications() {
    const dropdownList = document.getElementById('scholar-dropdown-list');
    const homepagePublicationsContainer = document.getElementById('homepage-publications-container');
    const publicationsContainer = document.getElementById('publications-container');

    if (!dropdownList && !homepagePublicationsContainer && !publicationsContainer) {
      return;
    }

    try {
      const response = await fetch('./assets/scholar-data.json');

      if (!response.ok) {
        throw new Error(`Failed to load publications: ${response.status}`);
      }

      const publications = await response.json();

      const renderPublicationCard = (publication) => {
        const card = document.createElement('article');
        card.className = 'rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm';

        const title = document.createElement('h3');
        title.className = 'text-lg font-bold text-gray-800';

        const titleLink = document.createElement('a');
        titleLink.href = publication.link;
        titleLink.target = '_blank';
        titleLink.rel = 'noopener noreferrer';
        titleLink.textContent = publication.title;

        title.appendChild(titleLink);

        const authors = document.createElement('p');
        authors.className = 'mt-2 text-sm text-gray-600';
        authors.textContent = publication.authors;

        const citationMeta = document.createElement('p');
        citationMeta.className = 'mt-1 text-sm italic text-gray-500';
        citationMeta.textContent = [publication.journal, publication.year].filter(Boolean).join(', ');

        card.appendChild(title);
        card.appendChild(authors);
        if (publication.description) {
          const description = document.createElement('p');
          description.className = 'mt-3 text-sm leading-6 text-gray-700';
          description.textContent = publication.description;
          card.appendChild(description);
        }
        card.appendChild(citationMeta);

        return card;
      };

      if (dropdownList) {
        dropdownList.innerHTML = '';

        publications.slice(0, 3).forEach((publication) => {
          const link = document.createElement('a');
          link.href = publication.link;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'block rounded-lg px-3 py-2 text-gray-700 transition hover:bg-slate-100 hover:text-blue-600';
          link.textContent = publication.title;
          dropdownList.appendChild(link);
        });
      }

      if (homepagePublicationsContainer) {
        homepagePublicationsContainer.innerHTML = '';
        publications.slice(0, 1).forEach((publication) => {
          homepagePublicationsContainer.appendChild(renderPublicationCard(publication));
        });
      }

      if (publicationsContainer) {
        publicationsContainer.innerHTML = '';

        publications.forEach((publication) => {
          publicationsContainer.appendChild(renderPublicationCard(publication));
        });
      }
    } catch (error) {
      console.error(error);

      if (dropdownList) {
        dropdownList.innerHTML = '<div class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Unable to load publications.</div>';
      }

      if (publicationsContainer) {
        publicationsContainer.innerHTML = '<div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Unable to load publications.</div>';
      }
    }
  }

  renderPublications();

  const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileMenuButton && mobileMenu) {
    const mobileMenuIcon = mobileMenuButton.querySelector('[data-mobile-menu-icon]');

    const toggleMobileMenu = () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));

      if (mobileMenuIcon) {
        mobileMenuIcon.classList.toggle('fa-bars', isOpen);
        mobileMenuIcon.classList.toggle('fa-xmark', !isOpen);
      }
    };

    mobileMenuButton.addEventListener('click', toggleMobileMenu);

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (!mobileMenu.classList.contains('hidden')) {
          toggleMobileMenu();
        }
      });
    });
  }

  if (!galleryImages.length) {
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'gallery-modal';
  modal.className = 'fixed inset-0 z-[60] hidden items-center justify-center bg-black/90 p-4';
  modal.innerHTML = `
    <div class="relative w-full max-w-5xl">
      <button type="button" class="absolute -top-14 right-0 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20" data-close-modal>
        Close
      </button>
      <img src="" alt="Expanded gallery image" class="mx-auto max-h-[85vh] w-auto rounded-2xl shadow-2xl" data-modal-image />
    </div>
  `;
  document.body.appendChild(modal);

  const modalImage = modal.querySelector('[data-modal-image]');
  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modalImage.src = '';
  };

  galleryImages.forEach((image) => {
    image.addEventListener('click', () => {
      modalImage.src = image.src;
      modalImage.alt = image.alt || 'Gallery image';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.matches('[data-close-modal]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
});
