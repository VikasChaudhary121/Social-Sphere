import express from "express";

export const signup = async (req, res) => {
  res.json({
    data: "you hit the signup page",
  });
};
export const login = async (req, res) => {
  res.json({
    data: "you hit the login page",
  });
};
export const logout = async (req, res) => {
  res.json({
    data: "you hit the logout page",
  });
};
