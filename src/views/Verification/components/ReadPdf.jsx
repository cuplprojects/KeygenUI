import React, { useState } from "react";
import Tesseract from "tesseract.js";
import pdfjsLib from "./pdfWorkerLoader";
import axios from "axios";

const ReadPdf = (pdfFile) => {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("eng");
  const [readingMode, setReadingMode] = useState("bilingual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  
  const handleFileChange = async (event) => {
    const files = pdfFile;
    if (files.length > 0) {
      setLoading(true);
      setError("");
      const allPromises = [];

      for (const file of files) {
        if (file.type !== "application/pdf") {
          setError("Only PDF files are accepted.");
          continue;
        }

        // Process page 3 to determine reading mode and language
        const pagenumbers = await processPage(file, 3,true);
        const isBilingual = checkForDuplicateQuestions(pagenumbers);
        setReadingMode(isBilingual ? "bilingual" : "monolingual");

        const processFile = async (file) => {
          let extractedText = "";
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDoc.numPages;

            const pagePromises = [];
            for (let i = 3; i <= numPages - 2; i++) {
              pagePromises.push(processPage(file, i,false));
            }

            const pageTexts = await Promise.all(pagePromises);
            extractedText = pageTexts.join("\n");
          } catch (error) {
            console.error("Error processing file:", error);
            setError("Error processing file. Please try again.");
          }

          return `File: ${file.name}\n${extractedText}\n`;
        };

        allPromises.push(processFile(file));
      }

      const allExtractedTexts = await Promise.all(allPromises);
      setText(allExtractedTexts.join("\n"));
      setLoading(false);
    }
  };

  const processPage = async (file, pageNum, isReading) => {
    let pagenumbers = "";

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      const imageData = canvas.toDataURL("image/png");

      const preprocessImage = (canvas, context) => {
        context.filter = "grayscale(100%) contrast(200%)";
        context.drawImage(canvas, 0, 0);
        return canvas.toDataURL("image/png");
      };

      const extractColumn = async (imageData, width, height, side) => {
        return new Promise((resolve) => {
          const columnCanvas = document.createElement("canvas");
          const columnContext = columnCanvas.getContext("2d");
          const columnWidth = width * 0.5;
          const xOffset = side === "left" ? 0 : columnWidth;
          columnCanvas.width = columnWidth;
          columnCanvas.height = height * 0.9;
          const img = new Image();
          img.src = imageData;
          img.onload = () => {
            columnContext.drawImage(img, xOffset, 0, columnWidth, height, 0, 0, columnWidth, height);
            resolve(preprocessImage(columnCanvas, columnContext));
          };
        });
      };

      const recognizeText = async (imageData, lang) => {
        try {
          const { data: { text } } = await Tesseract.recognize(imageData, lang, {
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_COLUMN,
            oem: Tesseract.OEM.LSTM_ONLY,
            config: {
              tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-=÷×/*()[]{}<>πΣ∫√σαβγδεζωψχφλμξυ",
            },
          });
          return text;
        } catch (error) {
          console.error("Error recognizing text:", error);
          return "";
        }
      };

      const leftColumn = await extractColumn(imageData, viewport.width, viewport.height, "left");
      const leftText = await recognizeText(leftColumn, language);
      let finalText = leftText;

      if (readingMode === "monolingual") {
        const rightColumn = await extractColumn(imageData, viewport.width, viewport.height, "right");
        const rightText = await recognizeText(rightColumn, language);
        finalText = `${leftText}\n${rightText}`;
      }

      let lines = finalText.split("\n");
      lines.pop(); // Remove last empty line if present
      const cleanedText = lines.join("\n");
      const processedText = cleanedText.replace(/\d+\\[A-Z\\]+[\d\s]+[\[\]]?/g, "");

      // Extract question number tags
      const questionTags = processedText.match(/^\d+\./gm) || [];
      const cleanedQuestionTags = questionTags.map((tag) => tag.replace(/\./g, ""));
      const catchNumber = file.name.split("_")[0];
      const seriesName = file.name.split("_")[1].split(".")[0];

      if(!isReading){
        await axios.post("https://localhost:44339/api/PdfData", {
        id: 0,
        pageNumber: `${pageNum}`,
        pageText: processedText,
        catchNumber: catchNumber,
        seriesName: seriesName,
        questionNumbers: cleanedQuestionTags.join(", "),
      });
      }
      // Send question number tags to the API
      

      pagenumbers = cleanedQuestionTags.join(", ");
    } catch (error) {
      console.error("Error processing page:", error);
      setError("Error processing page. Please try again.");
    }

    return pagenumbers;
  };

  const checkForDuplicateQuestions = (questionNumbers) => {
    const lines = questionNumbers.split(",");
    const questionMap = {};
    let hasDuplicates = false;

    lines.forEach(line => {
      const questionNumber = line.match(/^\d+/);
      if (questionNumber) {
        const number = questionNumber[0];
        questionMap[number] = (questionMap[number] || 0) + 1;
        if (questionMap[number] > 1) {
          hasDuplicates = true;
        }
      }
    });

    return hasDuplicates;
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        multiple
      />

      {/* Language Selection Dropdown */}
      <div>
        <label htmlFor="languageSelect">Select OCR Language: </label>
        <select
          id="languageSelect"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="eng">English</option>
          <option value="spa">Spanish</option>
          <option value="fra">French</option>
          <option value="deu">German</option>
          <option value="ita">Italian</option>
          <option value="por">Portuguese</option>
          <option value="rus">Russian</option>
          <option value="hin">Hindi</option>
          {/* Add more languages as needed */}
        </select>
      </div>

      {/* Reading Mode Dropdown */}
      <div>
        <label htmlFor="readingModeSelect">Select Reading Mode: </label>
        {/* <select
          id="readingModeSelect"
          value={readingMode}
          onChange={(e) => setReadingMode(e.target.value)}
          disabled
        >
          <option value="monolingual">Monolingual</option>
          <option value="bilingual">Bilingual</option>
        </select> */}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <pre>{text}</pre>
    </div>
  );
};

export default ReadPdf;




// import React, { useState, useEffect } from "react";
// import Tesseract from "tesseract.js";
// import pdfjsLib from "./pdfWorkerLoader"; // Ensure this is the correct import path for pdfjsLib
// import axios from "axios";

// const ReadPdf = () => {
//   const [text, setText] = useState("");
//   const [language, setLanguage] = useState("eng");
//   const [readingMode, setReadingMode] = useState("bilingual");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [pdfs, setPdfs] = useState([
//     { fileName: "6003_A.pdf" },
//     { fileName: "6003_B.pdf" },
//     { fileName: "6003_C.pdf" },
//     { fileName: "6003_D.pdf" },
// ]);



//   // Function to process the PDFs using their URLs
//   const processPdfUrls = async (pdfs) => {
//     setLoading(true);
//     setError("");

//     for (const pdf of pdfs) {
//       const pdfUrl = `http://localhost:7247/PDFFiles/${pdf.fileName}`; // Update this to your file paths


//       // Process the PDF
//       const extractedText = await processFile(pdfUrl, pdf.fileName);
//       setText((prev) => prev + extractedText); // Accumulate text from all PDFs
//     }

//     setLoading(false);
//   };

//   const processFile = async (url, fileName) => {
//     let extractedText = "";

//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const arrayBuffer = await response.arrayBuffer();
//       const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
//       const numPages = pdfDoc.numPages;

//       const pagePromises = [];
//       for (let i = 1; i <= numPages; i++) {
//         pagePromises.push(processPage(arrayBuffer, i, fileName));
//       }

//       const pageTexts = await Promise.all(pagePromises);
//       extractedText = `File: ${fileName}\n${pageTexts.join("\n")}\n`;
//     } catch (error) {
//       console.error("Error processing file:", error);
//       setError("Error processing file. Please try again.");
//     }

//     return extractedText;
//   };

//   const processPage = async (arrayBuffer, pageNum, fileName) => {
//     let pagenumbers = "";

//     try {
//       const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
//       const page = await pdfDoc.getPage(pageNum);
//       const viewport = page.getViewport({ scale: 2 });
//       const canvas = document.createElement("canvas");
//       const context = canvas.getContext("2d");
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       const renderContext = {
//         canvasContext: context,
//         viewport: viewport,
//       };

//       await page.render(renderContext).promise;
//       const imageData = canvas.toDataURL("image/png");

//       const preprocessImage = (canvas, context) => {
//         context.filter = "grayscale(100%) contrast(200%)";
//         context.drawImage(canvas, 0, 0);
//         return canvas.toDataURL("image/png");
//       };

//       const extractColumn = async (imageData, width, height, side) => {
//         return new Promise((resolve) => {
//           const columnCanvas = document.createElement("canvas");
//           const columnContext = columnCanvas.getContext("2d");
//           const columnWidth = width * 0.5;
//           const xOffset = side === "left" ? 0 : columnWidth;
//           columnCanvas.width = columnWidth;
//           columnCanvas.height = height * 0.9;
//           const img = new Image();
//           img.src = imageData;
//           img.onload = () => {
//             columnContext.drawImage(
//               img,
//               xOffset,
//               0,
//               columnWidth,
//               height,
//               0,
//               0,
//               columnWidth,
//               height
//             );
//             resolve(preprocessImage(columnCanvas, columnContext));
//           };
//         });
//       };

//       const recognizeText = async (imageData, lang) => {
//         try {
//           const { data: { text } } = await Tesseract.recognize(imageData, lang, {
//             tessedit_pageseg_mode: Tesseract.PSM.SINGLE_COLUMN,
//             oem: Tesseract.OEM.LSTM_ONLY,
//             config: {
//               tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-=÷×/*()[]{}<>πΣ∫√σαβγδεζωψχφλμξυ",
//             },
//           });
//           return text;
//         } catch (error) {
//           console.error("Error recognizing text:", error);
//           return "";
//         }
//       };

//       const leftColumn = await extractColumn(imageData, viewport.width, viewport.height, "left");
//       const leftText = await recognizeText(leftColumn, language);
//       let finalText = leftText;

//       if (readingMode === "monolingual") {
//         const rightColumn = await extractColumn(imageData, viewport.width, viewport.height, "right");
//         const rightText = await recognizeText(rightColumn, language);
//         finalText = `${leftText}\n${rightText}`;
//       }

//       let lines = finalText.split("\n");
//       lines.pop(); // Remove last empty line if present
//       const cleanedText = lines.join("\n");
//       const processedText = cleanedText.replace(/\d+\\[A-Z\\]+[\d\s]+[\[\]]?/g, "");

//       // Extract question number tags
//       const questionTags = processedText.match(/^\d+\./gm) || [];
//       const cleanedQuestionTags = questionTags.map((tag) => tag.replace(/\./g, ""));
//       const catchNumber = fileName.split("_")[0];
//       const seriesName = fileName.split("_")[1].split(".")[0];

//       await axios.post("https://localhost:7247/api/PdfData", {
//         id: 0,
//         pageNumber: `${pageNum}`,
//         pageText: processedText,
//         catchNumber: catchNumber,
//         seriesName: seriesName,
//         questionNumbers: cleanedQuestionTags.join(", "),
//       });

//       pagenumbers = cleanedQuestionTags.join(", ");
//     } catch (error) {
//       console.error("Error processing page:", error);
//       setError("Error processing page. Please try again.");
//     }

//     return pagenumbers;
//   };

//   // Trigger PDF processing when PDF data is fetched
//   useEffect(() => {
//     if (pdfs.length > 0) {
//       processPdfUrls(pdfs);
//     }
//   }, [pdfs]);

//   return (
//     <div>
//       <h1>Read PDF</h1>
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <div>
//         <h2>Extracted Text:</h2>
//         <pre>{text}</pre>
//       </div>

//       {/* Language Selection Dropdown */}
//       <div>
//         <label htmlFor="languageSelect">Select OCR Language: </label>
//         <select
//           id="languageSelect"
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//         >
//           <option value="eng">English</option>
//           {/* Add more languages as needed */}
//         </select>
//       </div>

//       {/* Reading Mode Selection */}
//       <div>
//         <label htmlFor="readingMode">Select Reading Mode: </label>
//         <select
//           id="readingMode"
//           value={readingMode}
//           onChange={(e) => setReadingMode(e.target.value)}
//         >
//           <option value="bilingual">Bilingual</option>
//           <option value="monolingual">Monolingual</option>
//         </select>
//       </div>
//     </div>
//   );
// };

// export default ReadPdf;
