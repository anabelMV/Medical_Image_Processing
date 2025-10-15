import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: "red" }}>Ocurrió un error en el visor DICOM.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
