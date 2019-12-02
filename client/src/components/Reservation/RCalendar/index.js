import React, { useState, useEffect } from 'react';
import { Calendar, Spin, Badge } from 'antd';
import { withFirebase } from '../../../shared/Firebase';
import * as moment from 'moment';

import './index.scss';

const RCalendar = ({updateChosenDate, firebase}) => {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        firebase.reservations().orderBy('date', 'desc').get()
        .then(snapshot => {
            const allReservations = snapshot.docs.map(res => res.data());
            setReservations(allReservations);
            console.log(allReservations);
        })
    }, []);

    const dateCellRender = (value) => {
        if(value >= moment().startOf('date') && value <= moment().endOf('month')){
            let d = reservations.filter(r => value.format("DD/MM/YYYY") === r.date);
            if(d.length > 0){
                return (
                    <Badge status={getDateStatus(d.length)} />
                )
            }
            return <Badge status="success" />
        }
        return null;
    }

    const getDateStatus = (num) => {
        if(num < 7) return 'success';
        else if(num < 12) return 'warning';
        else return 'error';
    }

    const onSelect = (date) => {
        updateChosenDate(moment(date._d).format("DD/MM/YYYY"));
    }

    return (
        <div className="reservation-calendar">
            {reservations.length > 0 ? (
                <Calendar 
                    fullscreen={false} 
                    onSelect={onSelect} 
                    dateCellRender={dateCellRender}
                    validRange={[moment(), moment().endOf('month')]}/>
            ) : <Spin />}
        </div>
    )
}

export default withFirebase(RCalendar);