import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import AuthContext from '../../contexts/Authcontext';
import axios from 'axios';

const Investments = () => {
    const { userToken } = useContext(AuthContext);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInvestments = async () => {
        try {
            const res = await axios.get(`http://192.168.1.185:4000/api/investments`, {
                headers: { 'x-auth-token': userToken }
            });
            setInvestments(res.data);
        } catch (error) {
            console.error('Error fetching investments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    const renderApprovers = (approvedBy) => {
        if (!approvedBy || approvedBy.length === 0) return 'None';
        return approvedBy.map(a => a.name.trim()).join(', ');
    };

    const renderInvestment = ({ item }) => {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>{item.name || 'No Name'}</Text>
                <Text style={styles.description}>{item.description || 'No Description'}</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={styles.value}>KES{item.amount?.toLocaleString() || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Expected Return:</Text>
                    <Text style={styles.value}>KES{item.expectedReturn?.toLocaleString() || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Start Date:</Text>
                    <Text style={styles.value}>{item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>End Date:</Text>
                    <Text style={styles.value}>{item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={[styles.status, {color: item.status === 'active' ? '#28a745' : '#dc3545'}]}>
                        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Approved By:</Text>
                    <Text style={styles.value}>{renderApprovers(item.approvedBy)}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Investments</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : investments.length === 0 ? (
                <Text style={styles.emptyText}>No investments found.</Text>
            ) : (
                <FlatList
                    data={investments}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    renderItem={renderInvestment}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    )
}

export default Investments

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        padding: 16,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#222',
        alignSelf: 'center',
    },
    loader: {
        marginTop: 40,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 40,
        fontSize: 18,
    },
    listContent: {
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 20,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 6,
    },
    description: {
        fontSize: 15,
        color: '#444',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        fontWeight: '600',
        color: '#555',
        fontSize: 15,
    },
    value: {
        color: '#222',
        fontSize: 15,
        fontWeight: '500',
    },
    status: {
        fontWeight: 'bold',
        fontSize: 15,
    },
})