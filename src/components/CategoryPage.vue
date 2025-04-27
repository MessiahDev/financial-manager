<template>
    <div class="category-page">
        <h1>Category Management</h1>
        <form @submit.prevent="addCategory" class="form-add-category">
            <input v-model="newCategory.name" placeholder="Enter category name" required />
            <button type="submit" class="btn-primary">Add Category</button>
        </form>
        <ul class="category-list">
            <li v-for="category in categories" :key="category.id" class="category-item">
                <span class="category-name">{{ category.name }}</span>
                <div class="actions">
                    <button @click="editCategory(category)" class="btn-secondary">Edit</button>
                    <button @click="deleteCategory(category.id)" class="btn-danger">Delete</button>
                </div>
            </li>
        </ul>
        <div v-if="editingCategory" class="edit-category-modal">
            <h2>Edit Category</h2>
            <form @submit.prevent="updateCategory" class="form-edit-category">
                <input v-model="editingCategory.name" required />
                <div class="modal-actions">
                    <button type="submit" class="btn-primary">Update</button>
                    <button @click="cancelEdit" class="btn-secondary">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import categoryService from "../services/categoryService";
import authService from "../services/authService";

export default {
    name: "CategoryPage",

    data() {
        return {
            categories: [],
            newCategory: { name: "", userId: null },
            editingCategory: null,
            userId: null,
        };
    },

    methods: {
        async fetchUserProfile() {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (!token) {
                    console.log("No token found, user not authenticated.");
                    return;
                }
                const user = await authService.getProfile();
                this.userId = user.id;
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        },

        async fetchCategories() {
            try {
                if (!this.userId) {
                    console.error("User ID is not set.");
                    return;
                }
                
                const response = await categoryService.getCategoryByUserId(this.userId);
                
                if (response && response.length === 0) {
                    this.categories = [];
                } else {
                    this.categories = response;
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.warn("No categories found for this user. Returning empty list.");
                    this.categories = [];
                } else {
                    console.error("Error fetching categories:", error);
                }
            }
        },

        async addCategory() {
            try {
                if (!this.userId) {
                    console.error("User ID is not set.");
                    return;
                }

                if (!this.newCategory.name.trim()) {
                    console.error("Category name is required.");
                    return;
                }

                this.newCategory.userId = this.userId;
                console.log("Sending category data:", this.newCategory);

                const addedCategory = await categoryService.createCategory(this.newCategory);
                
                this.categories.push({ ...addedCategory });

                this.newCategory.name = "";
            } catch (error) {
                console.error("Error adding category:", error);
            }
        },

        editCategory(category) {
            this.editingCategory = { ...category };
        },

        async updateCategory() {
            try {
                if (!this.editingCategory.name.trim()) {
                    console.error("Category name is required.");
                    return;
                }

                const updatedCategory = await categoryService.updateCategory(
                    this.editingCategory.id,
                    this.editingCategory
                );

                await this.fetchCategories();

                this.editingCategory = null;
            } catch (error) {
                console.error("Error updating category:", error);
            }
        },

        cancelEdit() {
            this.editingCategory = null;
        },

        async deleteCategory(id) {
            try {
                await categoryService.deleteCategory(id);
                this.categories = this.categories.filter((cat) => cat.id !== id);
            } catch (error) {
                console.error("Error deleting category:", error);
            }
        },
    },

    async mounted() {
        await this.fetchUserProfile();
        await this.fetchCategories();
    },
};
</script>

<style scoped>
.category-page {
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
    color: #4a90e2;
    margin-bottom: 20px;
}

.form-add-category {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
}

button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-primary {
    background-color: #4a90e2;
    color: #fff;
}

.btn-primary:hover {
    background-color: #357ab8;
}

.btn-secondary {
    background-color: #f0ad4e;
    color: #fff;
}

.btn-secondary:hover {
    background-color: #d98c2e;
}

.btn-danger {
    background-color: #d9534f;
    color: #fff;
}

.btn-danger:hover {
    background-color: #c9302c;
}

.category-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-name {
    font-size: 16px;
    font-weight: bold;
}

.actions button {
    margin-left: 10px;
}

.edit-category-modal {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
}

.modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}
</style>