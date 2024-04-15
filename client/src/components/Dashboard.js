import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#85144b', '#F012BE', '#3D9970', '#111111', '#AAAAAA'];

const Dashboard = ({ transactions }) => {
    // Preparing data for the category distribution chart
    const categoryData = transactions.reduce((acc, transaction) => {
        const { category } = transaction;
        if (category === "Payments/Refund") {
            return acc;
        }
        const valueToAdd = parseFloat(transaction.cost.replace('$', ''));
        const existing = acc.find(item => item.name === category);
        if (existing) {
            // Add value and fix to 2 decimal places
            existing.value = parseFloat((existing.value + valueToAdd).toFixed(2));
        } else {
            // Push new category with value fixed to 2 decimal places
            acc.push({ name: category, value: parseFloat(valueToAdd.toFixed(2)) });
        }
        return acc;
    }, []);

    // Example data processing for a bar chart (monthly spending)
    const monthlyData = transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.date).getMonth() + 1; // Get month and convert from 0-index
        const existing = acc.find(item => item.month === month);
        const cost = parseFloat(transaction.cost.replace('$', ''));
        if (existing) {
            existing.amount += cost;
        } else {
            acc.push({ month, amount: cost });
        }
        return acc;
    }, []);

    return (
        <div>
            <h2>Transaction Dashboard</h2>
            <PieChart width={400} height={400}>
                <Pie data={categoryData} cx={200} cy={200} outerRadius={80} fill="#8884d8" dataKey="value" label>
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>

            {/* <BarChart width={600} height={300} data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" />
            </BarChart> */}
        </div>
    );
};

export default Dashboard;
