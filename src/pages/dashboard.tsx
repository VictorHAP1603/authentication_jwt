import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {

    const { user } = useAuth()

    useEffect(() => {
        api.get('/me').then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    return (
        <div>
            <h1>DASHBOARD</h1>
            <h2>Olá {user?.email}, como está?</h2>
        </div>

    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get('/me');

    console.log(response.data)

    return {
        props: {}
    }
})