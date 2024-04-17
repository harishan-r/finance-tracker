import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, Sector } from 'recharts';
import { Table } from 'react-bootstrap'; // Assuming you're using React-Bootstrap

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#85144b', '#F012BE', '#3D9970'];

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10} 
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
        </g>
    );
};

const Dashboard = ({ transactions }) => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const onPieClick = (data, index) => {
        console.log("Clicked on:", data);
        if (data && data.payload) {
            setSelectedCategory(data.payload.name);
        } else {
            console.error("No payload data available");
        }
    };

    const categoryData = transactions.reduce((acc, transaction) => {
        const { category } = transaction;
        if (category === "Payments/Refund") {
            return acc;
        }
        const valueToAdd = parseFloat(transaction.cost.replace('$', ''));
        const existing = acc.find(item => item.name === category);
        if (existing) {
            existing.value = parseFloat((existing.value + valueToAdd).toFixed(2));
        } else {
            acc.push({ name: category, value: parseFloat(valueToAdd.toFixed(2)) });
        }
        return acc;
    }, []);

    const filteredTransactions = transactions.filter(transaction => transaction.category === selectedCategory);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
                {selectedCategory && (<h3 style={{ textAlign: 'center' }}>{selectedCategory}</h3>)}
                <PieChart width={400} height={400}>
                    <Pie
                        dataKey="value"
                        isAnimationActive={false}
                        data={categoryData}
                        cx={200}
                        cy={200}
                        outerRadius={100}
                        fill="#8884d8"
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={onPieEnter}
                        onClick={onPieClick}
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </div>
      
            
            {selectedCategory && (
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Cost</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map((trans, idx) => (
                        <tr key={idx}>
                            <td>{trans.date}</td>
                            <td>{trans.cost}</td>
                            <td>{trans.description}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            )}
    
        </div>
    );
};

export default Dashboard;
