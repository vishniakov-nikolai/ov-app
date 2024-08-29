
/**
 * @file Helper module for image processing.
 *
 * These functions and classes are only used internally,
 * meaning an end-user shouldn't need to access anything here.
 *
 * @module utils/image
 */
const BROWSER_ENV = true;
const WEBWORKER_ENV = BROWSER_ENV && constructor.name === 'DedicatedWorkerGlobalScope';

let createCanvasFunction;
let ImageDataClass;
if (BROWSER_ENV) {
    // Running in browser or web-worker
    createCanvasFunction = (/** @type {number} */ width, /** @type {number} */ height) => {
        if (!OffscreenCanvas) {
            throw new Error('OffscreenCanvas not supported by this browser.');
        }
        return new OffscreenCanvas(width, height)
    };
} else {
    throw new Error('Unable to load image processing library.');
}


// Defined here: https://github.com/python-pillow/Pillow/blob/a405e8406b83f8bfb8916e93971edc7407b8b1ff/src/libImaging/Imaging.h#L262-L268
const RESAMPLING_MAPPING = {
    0: 'nearest',
    1: 'lanczos',
    2: 'bilinear',
    3: 'bicubic',
    4: 'box',
    5: 'hamming',
}

/**
 * Mapping from file extensions to MIME types.
 */
const CONTENT_TYPE_MAP = new Map([
    ['png', 'image/png'],
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['gif', 'image/gif'],
]);

export class RawImage {
    data;
    width;
    height;
    channels;

    /**
     * Create a new `RawImage` object.
     * @param {Uint8ClampedArray|Uint8Array} data The pixel data.
     * @param {number} width The width of the image.
     * @param {number} height The height of the image.
     * @param {1|2|3|4} channels The number of channels.
     */
    constructor(data, width, height, channels) {
        this.data = data;
        this.width = width;
        this.height = height;
        this.channels = channels;
    }

    /**
     * Returns the size of the image (width, height).
     * @returns {[number, number]} The size of the image (width, height).
     */
    get size() {
        return [this.width, this.height];
    }

    /**
     * Helper method to create a new Image from a tensor
     * @param {Tensor} tensor
     */
    static fromTensor(tensor, channel_format = 'CHW') {
        if (tensor.dims.length !== 3) {
            throw new Error(`Tensor should have 3 dimensions, but has ${tensor.dims.length} dimensions.`);
        }

        if (channel_format === 'CHW') {
            tensor = tensor.transpose(1, 2, 0);
        } else if (channel_format === 'HWC') {
            // Do nothing
        } else {
            throw new Error(`Unsupported channel format: ${channel_format}`);
        }
        if (!(tensor.data instanceof Uint8ClampedArray || tensor.data instanceof Uint8Array)) {
            throw new Error(`Unsupported tensor type: ${tensor.type}`);
        }
        switch (tensor.dims[2]) {
            case 1:
            case 2:
            case 3:
            case 4:
                return new RawImage(tensor.data, tensor.dims[1], tensor.dims[0], tensor.dims[2]);
            default:
                throw new Error(`Unsupported number of channels: ${tensor.dims[2]}`);
        }
    }

    /**
     * Convert the image to grayscale format.
     * @returns {RawImage} `this` to support chaining.
     */
    grayscale() {
        if (this.channels === 1) {
            return this;
        }

        let newData = new Uint8ClampedArray(this.width * this.height * 1);
        switch (this.channels) {
            case 3: // rgb to grayscale
            case 4: // rgba to grayscale
                for (let i = 0, offset = 0; i < this.data.length; i += this.channels) {
                    const red = this.data[i];
                    const green = this.data[i + 1];
                    const blue = this.data[i + 2];

                    newData[offset++] = Math.round(0.2989 * red + 0.5870 * green + 0.1140 * blue);
                }
                break;
            default:
                throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
        }
        return this._update(newData, this.width, this.height, 1);
    }

    /**
     * Convert the image to RGB format.
     * @returns {RawImage} `this` to support chaining.
     */
    rgb() {
        if (this.channels === 3) {
            return this;
        }

        let newData = new Uint8ClampedArray(this.width * this.height * 3);

        switch (this.channels) {
            case 1: // grayscale to rgb
                for (let i = 0, offset = 0; i < this.data.length; ++i) {
                    newData[offset++] = this.data[i];
                    newData[offset++] = this.data[i];
                    newData[offset++] = this.data[i];
                }
                break;
            case 4: // rgba to rgb
                for (let i = 0, offset = 0; i < this.data.length; i += 4) {
                    newData[offset++] = this.data[i];
                    newData[offset++] = this.data[i + 1];
                    newData[offset++] = this.data[i + 2];
                }
                break;
            default:
                throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
        }
        return this._update(newData, this.width, this.height, 3);

    }

    /**
     * Convert the image to RGBA format.
     * @returns {RawImage} `this` to support chaining.
     */
    rgba() {
        if (this.channels === 4) {
            return this;
        }

        let newData = new Uint8ClampedArray(this.width * this.height * 4);

        switch (this.channels) {
            case 1: // grayscale to rgba
                for (let i = 0, offset = 0; i < this.data.length; ++i) {
                    newData[offset++] = this.data[i];
                    newData[offset++] = this.data[i];
                    newData[offset++] = this.data[i];
                    newData[offset++] = 255;
                }
                break;
            case 3: // rgb to rgba
                for (let i = 0, offset = 0; i < this.data.length; i += 3) {
                    newData[offset++] = this.data[i];
                    newData[offset++] = this.data[i + 1];
                    newData[offset++] = this.data[i + 2];
                    newData[offset++] = 255;
                }
                break;
            default:
                throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
        }

        return this._update(newData, this.width, this.height, 4);
    }

    async toBlob(type = 'image/png', quality = 1) {
        if (!BROWSER_ENV) {
            throw new Error('toBlob() is only supported in browser environments.')
        }

        const canvas = this.toCanvas();
        return await canvas.convertToBlob({ type, quality });
    }

    toCanvas() {
        if (!BROWSER_ENV) {
            throw new Error('toCanvas() is only supported in browser environments.')
        }

        // Clone, and convert data to RGBA before drawing to canvas.
        // This is because the canvas API only supports RGBA
        let cloned = this.clone().rgba();

        // Create canvas object for the cloned image
        let clonedCanvas = createCanvasFunction(cloned.width, cloned.height);

        // Draw image to context
        let data = new ImageData(cloned.data, cloned.width, cloned.height);
        clonedCanvas.getContext('2d').putImageData(data, 0, 0);

        return clonedCanvas;
    }

    /**
     * Helper method to update the image data.
     * @param {Uint8ClampedArray} data The new image data.
     * @param {number} width The new width of the image.
     * @param {number} height The new height of the image.
     * @param {1|2|3|4|null} [channels] The new number of channels of the image.
     * @private
     */
    _update(data, width, height, channels = null) {
        this.data = data;
        this.width = width;
        this.height = height;
        if (channels !== null) {
            this.channels = channels;
        }
        return this;
    }

    /**
     * Clone the image
     * @returns {RawImage} The cloned image
     */
    clone() {
        return new RawImage(this.data.slice(), this.width, this.height, this.channels);
    }

    /**
     * Helper method for converting image to have a certain number of channels
     * @param {number} numChannels The number of channels. Must be 1, 3, or 4.
     * @returns {RawImage} `this` to support chaining.
     */
    convert(numChannels) {
        if (this.channels === numChannels) return this; // Already correct number of channels

        switch (numChannels) {
            case 1:
                this.grayscale();
                break;
            case 3:
                this.rgb();
                break;
            case 4:
                this.rgba();
                break;
            default:
                throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
        }
        return this;
    }
}
