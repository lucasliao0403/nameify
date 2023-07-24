import React from 'react';
import plotdata from './distribution.json'
import { exp } from 'mathjs'

export function percentileNormalization(data, key) {
    let tempYSum = 0;
    let percentile = 0;
    let totalYSum = 0;
    let percentileArr = []
    if (key == "acousticness") {
        for (const a of plotdata.acousticness) {
            totalYSum += parseFloat(a.y);
        }

        for (let i = 0; i < data.length; i++) {
            tempYSum = 0;
            for (let j = 0; j < plotdata.acousticness.length; j++) {
                let x = parseFloat(plotdata.acousticness[j].x)
                let y = parseFloat(plotdata.acousticness[j].y)
                tempYSum += y
                if (data[i] < x) {
                    percentile = tempYSum/totalYSum
                    break
                }
            }
            percentileArr.push(percentile)
                
        }
    }

    if (key == "danceability") {
        for (const a of plotdata.danceability) {
            totalYSum += parseFloat(a.y);
        }

        for (let i = 0; i < data.length; i++) {
            tempYSum = 0;
            for (let j = 0; j < plotdata.danceability.length; j++) {
                let x = parseFloat(plotdata.danceability[j].x)
                let y = parseFloat(plotdata.danceability[j].y)
                tempYSum += y
                if (data[i] < x) {
                    percentile = tempYSum/totalYSum
                    break
                }
            }
            percentileArr.push(percentile)
                
        }
    }

    if (key == "valence") {return data}
    if (key == "energy") {return data}
    if (key == "instrumentalness") {return data}

    
    return (percentileArr);

    // compare data to x value in the json file (ranging from 0-1), line by line.
    // iterate through every json line
    // if the current value is less than the json line, then stop
    // add up all the previous y values, then divide that by all the y values added up.
    // that gives the percentile


}

export function sigmoidTransform(data, k, threshold) {
    let transformedData = data.map(value => 1 / (1 + exp(-k * (value - threshold))));
    return transformedData;
}

export function avg(arr) {
    let sum = 0;
    for (const num of arr) {
        sum += num
    }
    return ((sum/arr.length).toFixed(2))
}


