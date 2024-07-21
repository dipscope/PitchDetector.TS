import { Amdf } from '../src/pitch-detectors/amdf';
import { Asdf } from '../src/pitch-detectors/asdf';
import { McLeod } from '../src/pitch-detectors/mcleod';
import { Yin } from '../src/pitch-detectors/yin';

const sampleRate = 44100;
const frequency = 432;
const bufferSize = 1024;
const duration = 1;
const sampleFrequency = sampleRate / frequency;
const waveSamples = new Float32Array(sampleRate * duration);
const noiseSamples = new Float32Array(sampleRate * duration);

for (let i = 0; i < waveSamples.length; i++)
{
    waveSamples[i] = Math.sin(i / (sampleFrequency / (Math.PI * 2)));
}

for (let i = 0; i < noiseSamples.length; i++)
{
    noiseSamples[i] = Math.random() * 2 - 1;
}

function checkFrequency(detectedFrequency: number, expectedFrequency: number): void
{
    const range = 5;

    expect(expectedFrequency - range <= detectedFrequency && detectedFrequency <= expectedFrequency + range).toBeTrue();
}

describe('Pitch Detector', () => 
{
    it('AMDF should detect pitch correctly', () => 
    {
        const amdf = new Amdf();
        const detectedFrequency = amdf.detect(waveSamples, sampleRate);

        checkFrequency(detectedFrequency, frequency);
    });

    // it('AMDF return 0 if no valid pitch is detected', () => 
    // {
    //     const amdf = new Amdf();
    //     const detectedFrequency = amdf.detect(noiseSamples, sampleRate);

    //     expect(detectedFrequency).toBe(0);
    // });

    // it('ASDF should detect pitch correctly', () =>
    // {
    //     const asdf = new Asdf();
    //     const detectedFrequency = asdf.detect(waveSamples, sampleRate);
        
    //     expect(detectedFrequency).toBeCloseTo(frequency, 0.1);
    // });

    // it('McLEOD should detect pitch correctly', () =>
    // {
    //     const mcLeod = new McLeod(bufferSize);
    //     const detectedFrequency = mcLeod.detect(waveSamples, sampleRate);
        
    //     expect(detectedFrequency).toBeCloseTo(frequency, 0.1);
    // });

    // it('YIN should detect pitch correctly', () =>
    // {
    //     const yin = new Yin();
    //     const detectedFrequency = yin.detect(waveSamples, sampleRate);
        
    //     expect(detectedFrequency).toBeCloseTo(frequency, 0.1);
    // });
});
