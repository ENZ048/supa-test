import SupaChatbot from "./components/SupaChatbot"
import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '2px solid red', margin: '20px', backgroundColor: 'lightcoral' }}>
          <h2>Error in SupaChatbot Component</h2>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <p><strong>Stack:</strong> {this.state.error?.stack}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log("App component is rendering!");

  return (
    <>
    <ErrorBoundary>
      <SupaChatbot
      chatbotId={"688068d45ba526540d784b24"}
      apiBase={"https://api.0804.in/api"}
      />
    </ErrorBoundary>
    </>
  )
}

export default App
