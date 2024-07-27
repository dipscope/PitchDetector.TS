import { Amdf, Asdf, Frequency, PitchDetector, SampleRate, Yin } from '../src';

function constructPitchDetectors(): Array<PitchDetector>
{
    const pitchDetectors = new Array<PitchDetector>();
    
    pitchDetectors.push(new Amdf());
    pitchDetectors.push(new Asdf());
    pitchDetectors.push(new Yin());

    return pitchDetectors;
}

function constructFrequencies(): Array<Frequency>
{
    const frequencies = new Array<Frequency>();

    frequencies.push(100);
    frequencies.push(180);
    frequencies.push(242);
    frequencies.push(432);
    frequencies.push(440);
    frequencies.push(510);
    frequencies.push(600);
    frequencies.push(686);

    return frequencies;
}

function generateWaveSamples(frequency: Frequency, sampleRate: SampleRate): Float32Array
{
    const duration = 1;
    const sampleFrequency = sampleRate / frequency;
    const waveSamples = new Float32Array(sampleRate * duration);
    
    for (let i = 0; i < waveSamples.length; i++)
    {
        waveSamples[i] = Math.sin(i / (sampleFrequency / (Math.PI * 2)));
    }

    return waveSamples;
}

function generateNoiseSamples(sampleRate: SampleRate): Float32Array
{
    const duration = 1;
    const noiseSamples = new Float32Array(sampleRate * duration);
    
    for (let i = 0; i < noiseSamples.length; i++)
    {
        noiseSamples[i] = Math.random() * 2 - 1;
    }

    return noiseSamples;
}

function checkFrequency(detectedFrequency: number, expectedFrequency: number, range: number): void
{
    expect(expectedFrequency - range <= detectedFrequency && detectedFrequency <= expectedFrequency + range).toBeTrue();
}

describe('Pitch detector', () => 
{
    it('should detect pitch correctly', () => 
    {
        const sampleRate = 44100;
        const pitchDetectors = constructPitchDetectors();
        const frequencies = constructFrequencies();

        for (const pitchDetector of pitchDetectors)
        {
            for (const frequency of frequencies)
            {
                const waveSamples = generateWaveSamples(frequency, sampleRate);
                const detectedFrequency = pitchDetector.detect(waveSamples, sampleRate);

                checkFrequency(detectedFrequency, frequency, 5);
            }
        }
    });

    it('should detect noise correctly', () => 
    {
        const sampleRate = 44100;
        const pitchDetectors = constructPitchDetectors();

        for (const pitchDetector of pitchDetectors)
        {
            const noiseSamples = generateNoiseSamples(sampleRate);
            const detectedFrequency = pitchDetector.detect(noiseSamples, sampleRate);

            checkFrequency(detectedFrequency, 0, 0);
        }
    });
});
