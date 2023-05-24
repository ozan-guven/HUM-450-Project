import pandas as pd

def get_recensement():

    # Loading data
    recensement = pd.read_excel(io="1832_v4.xlsx", na_values=["·","?"])
    classes = pd.read_csv("classification_metiers.csv")
    rues = pd.read_csv("nom_rues_et_coor.csv", sep=",")
    regions = pd.read_csv("classification_origines.csv")
    
    # Adding the 'chef_vocation_categorie' column
    classes = classes.rename(columns={"JOB": "chef_vocation_norm_2"})
    classes = classes.rename(columns={"CLASS": "chef_vocation_categorie"})
    recensement = recensement.merge(classes, on="chef_vocation_norm_2", how="outer").reset_index(drop=True)

    # remove column "OCCURRENCES" of regions
    regions = regions.drop(columns=["OCCURRENCES"])

    # replace "69" by "1-2" in recensement's Division column
    recensement["Division"] = recensement["Division"].replace("69", "1-2")

    # Adding 'origin_region' column
    regions = regions.rename(columns={"ORIGINE": "chef_origine_norm_2"})
    regions = regions.rename(columns={"CLASSIFICATION": "origine_region"})
    recensement = recensement.merge(regions, on="chef_origine_norm_2", how="outer").reset_index(drop=True)
    
    # Split the values on the '/' character
    split_vals = recensement['chef_vocation_categorie'].str.split('/')

    # Create a new dataframe from the split values
    recensement = recensement.assign(chef_vocation_categorie=split_vals).explode('chef_vocation_categorie')

    # Adding coordinates
    correspondances = {
        "nom_rue": ["ale", "etraz", "rue du pre", "chaucrau", "st laurent", "st pierre", "st etienne", "bourg", "st francois", "georgette"],
        "nom_rue_norm_2": ["rue de l'ale", "rue d etraz", "rue du pre", "rue de chaucrau", "place de st laurent", "rue de st pierre", "st etienne", "rue de bourg", "place de st froncois", "chemin de georgette"]
    }
    for index, row in recensement.iterrows():
        nom_rue = row["nom_rue_norm_2"]
        if type(nom_rue) == float: continue # if nom_rue is NaN
        if nom_rue in correspondances["nom_rue"]:
            index = correspondances["nom_rue"].index(nom_rue)
            nom_rue = correspondances["nom_rue_norm_2"][index]
            corresponding_streets = rues.query("Nom_rue == @nom_rue")
        else:
            corresponding_streets = rues.query("Nom_rue.str.contains(@nom_rue)")
        occurences = len(corresponding_streets)
        if occurences == 1:
            recensement.at[index, "rue_lon"] = corresponding_streets["X"].values[0]
            recensement.at[index, "rue_lat"] = corresponding_streets["Y"].values[0]
            continue
        
    return recensement