// meltdown.js
//////////////////////////////////////////////////////////////
// Full JavaScript code for "cover" approach in resizeImages
// Step-based (snap) wheel scrolling AND a more intense displacement
//////////////////////////////////////////////////////////////

class MeltingPics {
  constructor(canvas, images, displacement) {
    this.canvas = canvas;
    this.imagesList = images;         // Array of loaded <img> from CreateJS
    this.displacementImage = displacement; // Displacement <img>
    
    // Bind methods
    this.resizeCanvas = this.resizeCanvas.bind(this);
    window.addEventListener('resize', this.resizeCanvas);

    // Create Pixi app
    this.createPixi();
    // Initial sizing
    this.resizeCanvas();
    // Add images to Pixi
    this.createImages();
    // Resize to "contain" each image fully
    this.resizeImages();
    // Reposition them in a vertical stack
    this.repositeContainers();

    // Render once
    this.app.render();

    // Fade in the canvas, then start rendering
    TweenMax.fromTo(
      this.canvas,
      1,
      { opacity: 0 },
      { opacity: 1, delay: 0.6, onComplete: this.app.start, onCompleteScope: this.app }
    );

    // Set up displacement filter
    this.dispText = PIXI.Texture.from(this.displacementImage);
    this.dispSprite = new PIXI.Sprite(this.dispText);
    this.dispFilter = new PIXI.filters.DisplacementFilter(this.dispSprite);
    this.dispFilter.autoFit = true;
    this.dispFilter.scale.set(0);
    
    // Enable "repeat" mode so it can tile if scaled
    this.dispSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

    // Add the displacement filter to the container
    this.container.filters = [this.dispFilter];
  }

  //////////////////////////////////////////
  // Pixi creation
  //////////////////////////////////////////
  createPixi() {
    PIXI.utils.skipHello();
    const options = {
      width: this.WIDTH,
      height: this.HEIGHT,
      view: this.canvas,
      transparent: false,
      antialias: true,
      resolution: window.devicePixelRatio,
      backgroundColor: 0xffffff,
      forceFXAA: true
    };
    this.app = new PIXI.Application(options);
    // We'll handle resizing manually
    this.app.renderer.autoResize = false;
  }

  //////////////////////////////////////////
  // Create images in Pixi
  //////////////////////////////////////////
  createImages() {
    this.images = [];
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    for (let i = 0; i < this.imagesList.length; i++) {
      const data = this.imagesList[i];
      const texture = PIXI.Texture.from(data);
      const imageSprite = new PIXI.Sprite(texture);

      // Use a container per image so we can position them easily
      const imageContainer = new PIXI.Container();
      imageContainer.addChild(imageSprite);
      this.container.addChild(imageContainer);

      // Save natural dimensions for custom scaling
      imageSprite.iniWidth = texture.width;
      imageSprite.iniHeight = texture.height;
      imageSprite.iniScale = texture.width / texture.height;

      // Keep a reference in the array
      this.images.push(imageContainer);
    }
  }


  resizeImages() {
    console.log("Resize images with 'cover' approach");
    for (let i = 0; i < this.images.length; i++) {
      let image = this.images[i].children[0];
  
      let iniW = image.iniWidth;
      let iniH = image.iniHeight;
      
      let imageAspect = iniW / iniH;
      let screenAspect = this.ASPECT;
  
      // "Cover" approach
      if (imageAspect < screenAspect) {
        image.width = this.WIDTH;
        image.height = this.WIDTH / imageAspect;
      } else {
       
    
        image.height = this.HEIGHT;
        image.width = this.HEIGHT * imageAspect;
      }
  
      // Center the image
      image.position.x = (this.WIDTH - image.width) / 2;
      // NOTE: dividing by 500 here is in your original code
      image.position.y = (this.HEIGHT - image.height) / 500;
    }
  }







  
  //////////////////////////////////////////
  // Position each image container vertically
  //////////////////////////////////////////
  repositeContainers() {
    for (let i = 0; i < this.images.length; i++) {
      this.images[i].position.y = this.HEIGHT * i;
    }
  }

  //////////////////////////////////////////
  // Handle meltdown (immediate approach)
  //////////////////////////////////////////
  updateDisplacementImmediate(coef) {
    const finy = -coef * this.HEIGHT * (this.images.length - 1);
    const dif = Math.abs(finy - this.container.position.y);

    this.container.position.y = finy;

    const scaleMultiplierY = 150;
    const scaleMultiplierX = 7;

    this.dispFilter.scale.y = dif * scaleMultiplierY * (this.WIDTH / this.HEIGHT / 2);
    this.dispFilter.scale.x = -dif / scaleMultiplierX;
  }

  //////////////////////////////////////////
  // Handle window resize
  //////////////////////////////////////////
  resizeCanvas() {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.ASPECT = this.WIDTH / this.HEIGHT;

    this.app.renderer.resize(this.WIDTH, this.HEIGHT);

    if (!this.images) return;
    this.repositeContainers();
    this.resizeImages();
  }

  //////////////////////////////////////////
  // Destroy app
  //////////////////////////////////////////
  destroy() {
    window.removeEventListener("resize", this.resizeCanvas);
    this.app.destroy(true);
    this.app = null;
  }
}

// ------------------------------------- //
// CreateJS load queue + usage example
// ------------------------------------- //

var images = [];
var displacementImg;
var queue = new createjs.LoadQueue(true);

// 1) Load displacement image
queue.loadFile({
  src: 'images/dis-map9.jpg',
  id: 'displacement',
  type: createjs.AbstractLoader.IMAGE
});

// 2) Load your local images
queue.loadFile({
  src: 'images/image-5.jpg',
  id: 'localImage1',
  type: createjs.AbstractLoader.IMAGE
}, false);

queue.loadFile({
  src: 'images/ieri.png',
  id: 'localImage2',
  type: createjs.AbstractLoader.IMAGE
}, false);

queue.loadFile({
  src: 'images/mala-p.png',
  id: 'localImage3',
  type: createjs.AbstractLoader.IMAGE
}, false);

queue.loadFile({
  src: 'images/bio-film2.png',
  id: 'localImage4',
  type: createjs.AbstractLoader.IMAGE
}, false);

queue.loadFile({
  src: 'images/future-st.png',
  id: 'localImage5',
  type: createjs.AbstractLoader.IMAGE
}, false);

queue.loadFile({
  src: 'images/sens.png',
  id: 'localImage6',
  type: createjs.AbstractLoader.IMAGE
}, false);

queue.loadFile({
  src: 'images/p-cultures2.png',
  id: 'localImage7',
  type: createjs.AbstractLoader.IMAGE
}, false);

// 3) Listen to 'fileload'
queue.on('fileload', (evt) => {
  if (evt.item.id === 'displacement') {
    displacementImg = evt.result;
  } else {
    images.push(evt.result);
  }
});

// 4) On complete, initialize MeltingPics
queue.on('complete', () => {
  const canvasElem = document.querySelector('canvas');
  const pics = new MeltingPics(canvasElem, images, displacementImg);

  // Optional: Set #fakescroll height
  const fakeScroll = document.getElementById('fakescroll');
  if (fakeScroll) {
    fakeScroll.style.height = (images.length * 100).toString() + "%";
  }

  // Optional: Reveal "scroll down" text
  const scrollDownElem = document.getElementById('scrolldown');
  if (scrollDownElem) {
    scrollDownElem.style.display = "block";
    TweenMax.from(scrollDownElem, 1, { opacity: 0 });
  }

  // Disable normal scrolling
  document.body.style.overflow = 'hidden';

  let currentIndex = 0;
  let isTweening = false;

  function scrollToIndex(index) {
    isTweening = true;
    const targetScrollY = index * window.innerHeight;

    TweenMax.to({}, 1, {
      ease: Power2.easeOut,
      onUpdate: function() {
        const t = this.progress();
        const currentY = window.scrollY;
        const newY = currentY + (targetScrollY - currentY) * t;
        window.scrollTo(0, newY);

        const factor = newY / (window.innerHeight * images.length - window.innerHeight);
        pics.updateDisplacementImmediate(factor);
      },
      onComplete: function() {
        isTweening = false;
        // Update pagination
        updatePaginationItems(index);
      }
    });
  }

  // --------------------------------------------------------
  //  PAGINATION WITH UNIQUE PROJECT LABELS
  // --------------------------------------------------------
  const projectTitles = [
    "Wet Metamorphosis",
    "Ieri",
    "Mala Project",
    "Bio Film",
    "Future Station",
    "Sensorium",
    "Protest Cultures"
  ];

  const paginationContainer = document.createElement('div');
  paginationContainer.classList.add('pagination');
  document.body.appendChild(paginationContainer);

  for (let i = 0; i < images.length; i++) {
    const paginationItem = document.createElement('div');
    paginationItem.classList.add('pagination-item');
    paginationItem.textContent = projectTitles[i] || `Project-${i + 1}`;
    if (i === 0) paginationItem.classList.add('active');

    paginationItem.addEventListener('click', () => {
      if (!isTweening && i !== currentIndex) {
        currentIndex = i;
        scrollToIndex(i);
      }
    });

    paginationContainer.appendChild(paginationItem);
  }

  function updatePaginationItems(index) {
    const items = paginationContainer.querySelectorAll('.pagination-item');
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }
  // --------------------------------------------------------
  //  END PAGINATION
  // --------------------------------------------------------

  // --------------------------------------------------------
  //  WHEEL EVENT LISTENER WITH THRESHOLD
  // --------------------------------------------------------
  let scrollDelta = 0;
  const threshold = 50; // Increase for *less* sensitivity (e.g., 80, 100, etc.)

  window.addEventListener('wheel', evt => {
    evt.preventDefault();
    if (isTweening) return;

    // Accumulate the wheel delta
    scrollDelta += evt.deltaY;

    // If user scrolls down beyond threshold
    if (scrollDelta > threshold) {
      if (currentIndex < images.length - 1) {
        currentIndex++;
        scrollToIndex(currentIndex);
      }
      // Reset the delta so the user must scroll again for the next slide
      scrollDelta = 0;
    }
    // If user scrolls up beyond negative threshold
    else if (scrollDelta < -threshold) {
      if (currentIndex > 0) {
        currentIndex--;
        scrollToIndex(currentIndex);
      }
      // Reset the delta
      scrollDelta = 0;
    }
  }, { passive: false });

});

// 5) Load items
queue.load();