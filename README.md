# AI Resume Analyzer

A full-stack AI-powered resume analysis application. Upload your resume (PDF/Image) and get instant scoring, feedback, and improvement suggestions. Built with React, Node.js, Express, MongoDB, Google Gemini AI, and Google Cloud Vision OCR.

## 🚀 Features

### Resume Analysis
- **📄 File Upload**: Drag & drop or click to upload resume (PDF, JPG, PNG)
- **🔍 OCR Text Extraction**: Google Cloud Vision extracts text from images/PDFs
- **📊 AI Scoring**: Get an overall score out of 100
- **📋 Section Scores**: Detailed scoring for each resume section
- **✅ Strengths Analysis**: Highlights what's working well
- **🔧 Improvement Suggestions**: Actionable recommendations
- **💼 Industry Tips**: Tailored advice for your field

### Chat Interface
- **💬 ChatGPT-like UI**: Modern, responsive chat interface
- **🧵 Thread Management**: Create, view, and delete conversation threads
- **💾 Persistent History**: All conversations saved to MongoDB
- **⚡ Real-time Responses**: Typing effect for AI responses
- **📝 Markdown Support**: Code highlighting and formatting
- **🌙 Dark Theme**: Beautiful dark theme with custom styling

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Markdown** - Markdown rendering
- **Rehype Highlight** - Code syntax highlighting
- **React Spinners** - Loading animations
- **UUID** - Unique ID generation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Multer** - File upload handling
- **Google Cloud Vision** - OCR text extraction

### AI
- **Google Gemini 2.0 Flash** - AI model via OpenAI-compatible API

## 📁 Project Structure

```
AI_RESUME/
├── Backend/
│   ├── index.js              # Express server entry point
│   ├── package.json
│   ├── .env                  # Environment variables
│   ├── models/
│   │   └── thread.models.js  # MongoDB schemas
│   ├── routes/
│   │   └── chat.js           # API routes
│   ├── uploads/              # Temporary file uploads
│   └── utils/
│       ├── openai.js         # Gemini AI client
│       ├── ocr.js            # Google Vision OCR
│       └── upload.js         # Multer configuration
│
└── Frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx           # Main app component
        ├── App.css           # Global styles
        ├── MyContext.jsx     # React context
        └── Components/
            ├── Chat/         # Chat messages & upload UI
            ├── ChatWindow/   # Main chat area
            └── SideBar/      # Thread list sidebar
```

## 🔧 Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API key
- Google Cloud Vision API credentials (service account JSON)

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai_resume
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=./your-service-account.json
```

Start the server:
```bash
npx nodemon index.js
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/thread` | Get all threads |
| `GET` | `/api/thread/:id` | Get thread messages |
| `POST` | `/api/thread` | Create new thread |
| `DELETE` | `/api/thread/:id` | Delete thread |
| `POST` | `/api/chat` | Send message or upload file for analysis |
| `POST` | `/api/extract-text` | Extract text from uploaded file (OCR) |

### Chat Endpoint Usage

**Regular Chat (JSON):**
```json
POST /api/chat
{
  "threadId": "uuid-here",
  "message": "Your message"
}
```

**Resume Upload (FormData):**
```
POST /api/chat
- threadId: "uuid-here"
- file: [resume.pdf]
```

## 🎨 UI Features

- **Upload Area**: Drag & drop zone with file validation
- **Sidebar**: Thread history with new chat button
- **Chat Window**: Message display with markdown support
- **Input Area**: Text input with send button
- **Loading States**: Spinner while analyzing resume
- **Typing Effect**: Word-by-word display of AI responses
- **Auto-scroll**: Automatically scrolls to latest message
- **Error Handling**: User-friendly error messages

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Google Cloud service account JSON |

## 📝 Usage

1. Start the backend server (`cd Backend && npx nodemon index.js`)
2. Start the frontend (`cd Frontend && npm run dev`)
3. Open `http://localhost:5173` in your browser
4. **Upload Resume**: Drag & drop or click to upload your resume
5. **Get Analysis**: AI analyzes and scores your resume
6. **Chat**: Ask follow-up questions about your resume
7. **View History**: Access previous conversations from sidebar

## 🔄 Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Upload Resume  │ ──▶ │  OCR Extraction │ ──▶ │ Format for AI   │
│  (PDF/Image)    │     │  (Google Vision)│     │ (5000 tokens)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Display Result │ ◀── │  AI Analysis    │ ◀── │ Score & Review  │
│  (Markdown)     │     │  (Gemini 2.0)   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Ambadas Joshi**

- GitHub: [@Amba34](https://github.com/Amba34)
