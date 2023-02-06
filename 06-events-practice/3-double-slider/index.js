export default class DoubleSlider {
  element = null;
  subElements = {};
  clickTarget = {};
  values = [];
  static MAX_PERCENT = 100;
  static MIN_PERCENT = 0;

  constructor({
    minVal = 0,
    maxVal = 100,
    step = 2,
    left = 10,
    right = 90,
    valueTemplate = (data) => `$${data}`,
  } = {}) {
    this._left = left;
    this._right = right;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.step = step > 0 ? step : 0;
    this.valueTemplate = valueTemplate;

    this.render();
    this.init();
  }

  render() {
    this.range = this.maxVal - this.minVal;
    this.updateValues();

    const wrap = document.createElement("div");
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;

    for (const item of this.element.querySelectorAll(
      '[class^="range-slider"]'
    )) {
      this.subElements[
        item.className.replace("range-slider__", "").replace("thumb-", "")
      ] = item;
    }
    let i = 0;
    for (const item of this.element.querySelectorAll("span")) {
      if (!item.className) {
        this.subElements[i++] = item;
      }
    }
  }

  getTemplate() {
    return `  <div class="range-slider">
    <span>${this.valueTemplate(this.values[0])}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress"style="left: ${this.left}%; right:${
      DoubleSlider.MAX_PERCENT - this.right
    }%"></span>
      <span class="range-slider__thumb-left" style="left: ${this.left}%"></span>
      <span class="range-slider__thumb-right" style="right:${
        DoubleSlider.MAX_PERCENT - this.right
      }%"></span>
        </div>
      <span>${this.valueTemplate(this.values[1])}</span>
    </div>`;
  }

  move = (event) => {
    if (this.clickTarget === this.subElements.right) {
      this.right = this.pixelToPersent(event.clientX - this.baseCoords.x);
    }
    if (this.clickTarget === this.subElements.left) {
      this.left = this.pixelToPersent(event.clientX - this.baseCoords.x);
    }
  };

  pixelToPersent(pixel) {
    return Number((pixel / this.mousePersentStep).toFixed(this.step));
  }

  pointerDown = (event) => {
    this.baseCoords = this.subElements.inner.getBoundingClientRect();
    this.mousePersentStep = this.baseCoords.width / 100;
    this.clickTarget = event.target.closest("span");

    document.addEventListener("mousemove", this.move);
  };

  init() {
    this.subElements.left.addEventListener("pointerdown", this.pointerDown);
    this.subElements.right.addEventListener("pointerdown", this.pointerDown);
    document.addEventListener("pointerup", () => {
      this.clickTarget = {};
      document.removeEventListener("mousemove", this.move);
    });
  }

  updateVisual() {
    this.subElements.left.style.left = this.left + "%";
    this.subElements.right.style.right = `${
      DoubleSlider.MAX_PERCENT - this.right
    }%`;
    this.subElements.progress.style.left = this.left + "%";
    this.subElements.progress.style.right = `${
      DoubleSlider.MAX_PERCENT - this.right
    }%`;
    this.values.forEach((val, index) => {
      this.subElements[index].textContent = this.valueTemplate(val);
    });
  }

  updateValues() {
    this.values = [this.getFromValue(), this.getToValue()];
  }

  updateAll() {
    this.updateValues();
    this.updateVisual();
    this.dispatchValues();
  }

  getFromValue() {
    return parseFloat(
      (this.minVal + (this.range * this.left) / 100).toFixed(this.step)
    );
  }

  getToValue() {
    return parseFloat(
      (this.minVal + (this.range * this.right) / 100).toFixed(this.step)
    );
  }

  get left() {
    return this._left;
  }
  get right() {
    return this._right;
  }
  set left(val) {
    const oldLeft = this.left;
    if (val <= DoubleSlider.MIN_PERCENT) {
      this._left = DoubleSlider.MIN_PERCENT;
    } else if (val >= this.right) {
      this._left = this.right - 10 ** -this.step;
    } else {
      this._left = val;
    }
    if (oldLeft !== this.left) {
      this.updateAll();
    }
  }

  set right(val) {
    const oldRight = this.right;
    if (val >= DoubleSlider.MAX_PERCENT) {
      this._right = DoubleSlider.MAX_PERCENT;
    } else if (val <= this.left) {
      this._right = this.left + 10 ** -this.step;
    } else {
      this._right = val;
    }
    if (oldRight !== this.right) {
      this.updateAll();
    }
  }

  dispatchValues() {
    this.element.dispatchEvent(
      new CustomEvent("range-select", { detail: this.values, bubbles: true })
    );
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.clickTarget = {};
    this.values = {};
  }
}
