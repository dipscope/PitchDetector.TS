import { PitchDetectorOptions } from '../pitch-detector-options';

/**
 * Represents options which can be configured for YIN pitch detector.
 * 
 * @type {YinOptions}
 */
export type YinOptions = PitchDetectorOptions &
{
    /**
     * The first significant minimum that corresponds to the fundamental frequency. The threshold 
     * is typically a value between 0 and 1.
     * 
     * Default value: 0.1.
     * 
     * @type {number}
     */
    threshold: number;
};
