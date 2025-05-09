// Select all main accordion containers and nested accordions
const accordions = document.querySelectorAll('.accordion');
const nestedAccordions = document.querySelectorAll('.nested-accordion');

// Handle main accordions
accordions.forEach(accordion => {
    const header = accordion.querySelector('.accordion-container');
    const content = accordion.querySelector('.accordion-content');
    const arrow = header.querySelector('.ri-arrow-down-s-line');

    header.addEventListener('click', () => {
        // Toggle the content
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
        
        // Rotate arrow icon
        arrow.style.transform = content.style.display === 'block' ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // Initialize state
    content.style.display = 'none';
});

// Handle nested accordions
nestedAccordions.forEach(nestedAccordion => {
    const nestedHeader = nestedAccordion.querySelector('.nested-header');
    const nestedContent = nestedAccordion.querySelector('.nested-content');
    const nestedArrow = nestedHeader.querySelector('.ri-arrow-down-s-line');

    nestedHeader.addEventListener('click', (e) => {
        // Prevent event from bubbling up to parent accordion
        e.stopPropagation();

        // Toggle the nested content
        nestedContent.style.display = nestedContent.style.display === 'block' ? 'none' : 'block';
        
        // Rotate nested arrow icon
        nestedArrow.style.transform = nestedContent.style.display === 'block' ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // Initialize state
    nestedContent.style.display = 'none';
});
