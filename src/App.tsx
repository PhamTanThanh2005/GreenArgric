import React from 'react';
import { AppRoutes } from "./routes/index";

function App() {
  return (
    // Nơi đây cực kỳ lý tưởng để bọc các Provider sau này.
    // Ví dụ: 
    // <Provider store={store}>
    //   <ThemeProvider>
            <AppRoutes />
    //   </ThemeProvider>
    // </Provider>
  );
}

export default App;