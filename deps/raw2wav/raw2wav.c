#include <stdio.h>
#include <stdlib.h>
#include "string.h"

typedef struct {
    unsigned char   ChunkID[4];       // "RIFF"
    unsigned int    ChunkSize;        // 36 + Subchunk2Size
    unsigned char   Format[4];        // "WAVE"
    unsigned char   Subchunk1ID[4];   // "fmt "
    unsigned int    Subchunk1Size;    // 16 for PCM
    unsigned short  AudioFormat;      // PCM = 1
    unsigned short  NumChannels;      // Mono = 1, Stereo = 2
    unsigned int    SampleRate;       // 44100
    unsigned int    ByteRate;         // SampleRate * NumChannels * BitsPerSample/8
    unsigned short  BlockAlign;       // NumChannels * BitsPerSample/8
    unsigned short  BitsPerSample;    // 8, 16
    unsigned char   Subchunk2ID[4];   // "data"
    unsigned int    Subchunk2Size;    // data length
} WaveHeader;

int raw2wav (char * rawFilename, char * wavFilename);



int main(int argc, char *argv[])
{
  return raw2wav (argv[1],argv[2]);
}



int raw2wav (char * rawFilename, char * wavFilename) {

  // open rawFile
  FILE * rawFile;
  rawFile = fopen(rawFilename, "rb");
  if (!rawFile) {
    return 1;
  }

  // size of rawFile
  int rawFileSize;
  {
    fseek(rawFile, 0, SEEK_END);
    rawFileSize = ftell(rawFile);
    fseek(rawFile, 0, SEEK_SET);
  }

  WaveHeader waveHeader;
  memcpy(waveHeader.ChunkID,"RIFF",4);
  waveHeader.ChunkSize = 36 + rawFileSize;
  memcpy(waveHeader.Format,"WAVE",4);
  memcpy(waveHeader.Subchunk1ID,"fmt ",4);
  waveHeader.Subchunk1Size = 16;
  waveHeader.AudioFormat = 1;
  waveHeader.NumChannels = 2;
  waveHeader.SampleRate = 44100;
  waveHeader.ByteRate = waveHeader.SampleRate * waveHeader.NumChannels * waveHeader.BitsPerSample / 8;
  waveHeader.BlockAlign = waveHeader.NumChannels * waveHeader.BitsPerSample / 8;
  waveHeader.BitsPerSample = 16;
  memcpy(waveHeader.Subchunk2ID,"data",4);
  waveHeader.Subchunk2Size = rawFileSize;

  // open wavFile
  FILE * wavFile;
  wavFile = fopen(wavFilename, "wb");
  if (!wavFile) {
    return 2;
  }

  // copy header
  fwrite(&waveHeader, 1, sizeof(waveHeader), wavFile);

  // copy data
  char buf[256];
  size_t readSize;
  while ((readSize = fread(buf, 1, sizeof(buf), rawFile)) > 0) {
    fwrite(buf, 1, readSize, wavFile);
  }

  // close wavFile,rawFile
  fclose(wavFile);
  fclose(rawFile);

  return 0;
}
