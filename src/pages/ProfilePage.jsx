import axiosInstance from '../api/axiosInstance';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const ProfilePage = () => {
    const { user, loginUser, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/users/${user.id}`);
            const u = response.data;
            setProfileData({
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
            });
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    const fetchAddresses = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/addresses/user/${user.id}`);
            setAddresses(response.data);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to load addresses');
        }
    }, [user.id]);

    useEffect(() => {
        fetchUserData();
        fetchAddresses();
    }, [fetchUserData, fetchAddresses]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
            };

            await axiosInstance.put(`/users/${user.id}`, payload);
            loginUser({
                ...user,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
            }, token);
            toast.success('Profile updated');
            setProfileData(prev => ({ ...prev, password: '' }));
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };
    const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
    const labelClass = "block text-xs font-semibold text-black uppercase tracking-wide mb-1.5";

    {loading && <LoadingSpinner />}
    {loading && <LoadingSpinner height="h-32" />}

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-1">
                    My Profile
                </h1>
                <p className="text-sm text-gray-500">Manage your account details</p>

                {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
                    <div className="mt-3">
                        <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 ${
                            user?.role === 'ADMIN'
                                ? 'bg-black text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}>
                            {user?.role}
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Profile form */}
                <div className="border border-gray-200 p-8">
                    <h2 className="text-sm font-black uppercase tracking-wide text-black mb-6">
                        Personal Information
                    </h2>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleProfileChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleProfileChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-black text-white text-sm font-semibold uppercase tracking-wide py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                    <Link
                        to="/change-password"
                        className="block text-center border border-black text-black text-xs font-semibold uppercase tracking-wide py-2.5 hover:bg-gray-50 transition-colors mt-3"
                    >
                        Change Password
                    </Link>
                </div>

                {/* Addresses */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black uppercase tracking-wide text-black">
                            My Addresses
                        </h2>
                        <Link
                            to="/addresses"
                            className="text-xs font-semibold uppercase tracking-wide text-black hover:underline"
                        >
                            Manage Addresses →
                        </Link>
                    </div>

                    {addresses.length === 0 ? (
                        <div className="border border-gray-200 p-8 text-center">
                            <p className="text-sm text-gray-400 mb-4">No addresses saved yet</p>
                            <Link
                                to="/addresses"
                                className="text-xs font-semibold uppercase tracking-wide bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
                            >
                                Add Address
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map(address => (
                                <div key={address.id} className="border border-gray-200 p-5">
                                    <p className="text-sm font-semibold text-black mb-1">
                                        {address.street}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {address.city}, {address.postalCode}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {address.country}
                                    </p>
                                </div>
                            ))}
                            <Link
                                to="/addresses"
                                className="block text-center text-xs font-semibold uppercase tracking-wide border border-black text-black px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                                Manage Addresses
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;