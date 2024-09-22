const http = require('http');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'data.json');

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/hospitals') {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Server error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });

    } else if (req.method === 'POST' && req.url === '/hospitals') {

            let body = '';
    
            req.on('data', chunk => {
                body += chunk.toString();
            });
    
            req.on('end', () => {
                const newHospital = JSON.parse(body);
    
                fs.readFile(dataPath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Server error' }));
                    } else {
                        const hospitals = JSON.parse(data).hospitals;
                        hospitals.push(newHospital);
    
                        fs.writeFile(dataPath, JSON.stringify({ hospitals }), err => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Failed to write' }));
                            } else {
                                res.writeHead(201, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(newHospital));
                            }
                        });
                    }
                });
            });
        }

        else if (req.method === 'PUT' && req.url.startsWith('/hospitals/')) {
    
            const hospitalName = decodeURIComponent(req.url.split('/')[2]); 
            let body = '';
        

            req.on('data', chunk => {
                body += chunk.toString();
            });
        
            req.on('end', () => {
                const updatedData = JSON.parse(body);
        
                fs.readFile(dataPath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Server error' }));
                    } else {
                        const hospitals = JSON.parse(data).hospitals;
                        const hospitalIndex = hospitals.findIndex(h => h.name === hospitalName);
        
                        if (hospitalIndex !== -1) {
                            hospitals[hospitalIndex] = { ...hospitals[hospitalIndex], ...updatedData };
                            fs.writeFile(dataPath, JSON.stringify({ hospitals }), err => {
                                if (err) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ message: 'Failed to update' }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify(hospitals[hospitalIndex]));
                                }
                            });
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Hospital not found' }));
                        }
                    }
                });
            });
        }
        else if (req.method === 'DELETE' && req.url.startsWith('/hospitals/')) {
            // DELETE: Remove a hospital by name
            const hospitalName = decodeURIComponent(req.url.split('/')[2]);
            fs.readFile(dataPath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Server error' }));
                } else {
                    const hospitals = JSON.parse(data).hospitals;
                    const hospitalIndex = hospitals.findIndex(h => h.name === hospitalName);
                    if (hospitalIndex !== -1) {
                        hospitals.splice(hospitalIndex, 1);  // Remove the hospital
                        fs.writeFile(dataPath, JSON.stringify({ hospitals }), (err) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Failed to delete' }));
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Hospital deleted' }));
                            }
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Hospital not found' }));
                    }
                }
            });
        }
        
    });
// Start the server
server.listen(3000, () => {
    console.log('Server running on port 3000');
});
