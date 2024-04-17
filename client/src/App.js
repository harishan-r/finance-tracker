//App.js 

import React, { useState, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import FileDrop from './components/FileDrop'; 
import Dashboard from './components/Dashboard';

function App() { 
	const [transactions, setTransactions] = useState([]);
	const handleTransactionsUpdate = (newTransactions) => {
		const concatTrans = transactions.concat(newTransactions);
        setTransactions(concatTrans);
    };


	const headStyle = { 
		textAlign: "center", 
	}; 

	return ( 
		<div> 
		<h1 style={headStyle}>Finance Tracker</h1> 
		<BrowserRouter> 
			<Routes> 
			<Route path='/' element={
				<div>
					<FileDrop onTransactionsUpdate={handleTransactionsUpdate}/>
					{transactions.length > 0 && <Dashboard transactions={transactions} />}
				</div>
			}></Route> 
			</Routes> 
		</BrowserRouter> 
		</div> 
	); 
} 

export default App;
