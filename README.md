
# Codeion

Codeion is a sample web app developed for POC by integrating ChatGpt with Azure's Whisher API.


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file in server.

`OPENAI_API_KEY` - ChatGpt API Key.

`SPEECH_KEY` - Azure's Whisper API Key.

`SPEECH_REGION` - Azure's Availablility Region


## Deployment

### Client
To deploy this project run

```bash
  npm install

  npm run build
```

### Server

To deploy this project run

```bash
  npm install
  
  npm run server
```