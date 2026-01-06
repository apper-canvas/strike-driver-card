import { useEffect } from 'react';

const PromptPassword = () => {
    useEffect(() => {
        const { ApperUI } = window.ApperSDK;
        ApperUI.showPromptPassword('#authentication-prompt-password');
    }, []);

    return (
        <>
            <div className="flex-1 py-12 px-5 flex justify-center items-center min-h-screen bg-gradient-to-br from-background via-surface to-background">
                <div id="authentication-prompt-password" className="bg-surface border border-primary/20 mx-auto w-[400px] max-w-full p-10 rounded-2xl shadow-2xl"></div>
            </div>
        </>
    );
};

export default PromptPassword;