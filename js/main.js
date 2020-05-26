const url = "../docs/PDF.pdf";

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    scale = 1.2;

const canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render the page

const renderPage = (num) => {
    pageIsRendering = true;

    // Get page
    pdfDoc.getPage(num).then(page => {
        // Set scale
        const viewport = page.getViewport( {scale} );
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderCtx = {
            canvasContext: ctx,
            viewport
        };
        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
            if(pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output Current Page
        document.querySelector('#page-num').textContent = num;
    });
}

// Check for pages rendering
const queueRenderPage = num => {
    if(pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

// Show prev Page
const showPrevPage = () => {
    if(pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Show next Page
const showNextPage = () => {
    if(pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Zoom in page
const zoomInPage = () => {
    scale += 0.1;
    renderPage(pageNum);
}

const zoomOutPage = () => {
    scale -= 0.1;
    renderPage(pageNum);
}

const resetPage = () => {
    scale = 1.2;
    renderPage(pageNum)
}

// Get Document

pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum);
})
  .catch(err => {
      //Display error
      const div = document.createElement('div');
      div.className='error';
      div.appendChild(document.createTextNode(err.message));
      document.querySelector('body').insertBefore(div, canvas);
      // Remove top bar
      document.querySelector('.top-bar').style.display = 'none';
  })

//Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);

document.querySelector('#next-page').addEventListener('click', showNextPage);

document.querySelector('#zoom-in-btn').addEventListener('click', zoomInPage);

document.querySelector('#zoom-out-btn').addEventListener('click', zoomOutPage);

document.querySelector('#reset-zoom-btn').addEventListener('click', resetPage);