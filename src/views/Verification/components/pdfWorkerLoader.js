// src/pdfWorkerLoader.js
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// import workerUrl from 'pdfjs-dist/build/pdf.worker?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

export default pdfjsLib;
