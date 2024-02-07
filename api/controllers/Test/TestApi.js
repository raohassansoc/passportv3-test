const TestApi = () => {
    const get = (req, res) => {
        console.log("Test API is working")
        return res.status(200).json({
            code: 200,
            success: true,
        });
    }

    return {
        get
    }
}

module.exports = TestApi